'use strict';

const Nodal = require('nodal');
const Offer = Nodal.require('app/models/offer.js');
const Order = Nodal.require('app/models/order.js');
const Errors = Nodal.require('config/errors.json');
const Constants = Nodal.require('config/constants.js');
const Restaurant = Nodal.require('app/models/restaurant.js');
const AuthController = Nodal.require('app/controllers/auth_controller.js');
const RestaurantHelper = Nodal.require('app/helpers/restaurants_helper.js');

const RedisHelper = Nodal.require('app/helpers/redis_helper.js');

const PubRedis = new RedisHelper()

const offerColumns = Offer.columns().reduceRight((memo, c) => {
  if (!Order.isHidden(c.name)) {
    memo.unshift(c.name)
  }
  return memo;
}, [ 'order' ]);

class RestaurantOffersController extends AuthController {

  getApproved (restaurantId) {

    const options = {
      approved: true,
      canceled: false,
      restaurant_id: restaurantId,
      order__active: false,
      order__expired: false,
      order__delivered: false,
    }

    Offer
    .query()
    .where(options)
    .join('order')
    .end((err, res) => {

      if (err) {
        return this.respond(err)
      }

      return this.respond(res, offerColumns)

    })

  }

  getHistory (restaurantId) {
    const options = {
      approved: true,
      restaurant_id: restaurantId,
      order__active: false,
      order__expired: false,
      order__delivered: true
    }

    Offer
    .query()
    .where(options)
    .join('order')
    .end((err, res) => {

      if (err) {
        return this.respond(err)
      }

      const options = {
        approved: true,
        restaurant_id: restaurantId,
        order__active: false,
        order__expired: true
      }

      Offer
      .query()
      .where(options)
      .join('order')
      .end((err, resExpired) => {

        res = res.concat(resExpired)

        return this.respond(res, offerColumns)

      })


    })
  }

  defaultAnswer (restaurantId) {
    const options = {
      restaurant_id: restaurantId,
      approved: false,
      canceled: false,
      order__active: true,
      order__delivered: false,
    }

    Offer
    .query()
    .where(options)
    .end((err, res) => {

      if (err) {
        return this.respond(err)
      }

      return this.respond(res, offerColumns)

    })
  }

  getReport (restaurantId) {

    RestaurantHelper.generateReport(restaurantId, (err, report) => {

      if (err) {
        return this.respond(err)
      }

      this.respond(report)

    })

  }

  get () {

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err)
      }

      Restaurant.getByUserId(user.get('id'), (err, restaurant) => {

        if (err) {
          return this.respond(err)
        }

        const isReport = this.params.query.report === 'true'
        const isHistory = this.params.query.history === 'true'
        const isApproved = this.params.query.approved === 'true'

        if (isReport) {
          return this.getReport(restaurant.get('id'))
        }
        else if (isHistory) {
          return this.getHistory(restaurant.get('id'))
        }
        else if (isApproved) {
          return this.getApproved(restaurant.get('id'))
        }

        return this.defaultAnswer(restaurant.get('id'))

      })

    })

  }

  destroy () {

    const id = this.params.route.id;

    if (!id || Number.isNaN(parseInt(id))) {
      return this.badRequest();
    }

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err)
      }

      Restaurant.getByUserId(user.get('id'), (err, restaurant) => {

        if (err) {
          return this.respond(err)
        }

        const options = {
          id: id,
          restaurant_id: restaurant.get('id')
        }

        Offer
        .query()
        .where(options)
        .join('order')
        .end((err, res) => {

          if (err) {
            return this.respond(err)
          }

          if (res.length === 0) {
            return this.respond(new Error(Errors['COULD_NOT_FIND_OFFER']))
          }

          const offer = res.pop()
          const order = offer.joined('order')

          const saveOffer = () => {
            offer.set('canceled', true)

            offer.save((err, model) => {

              if (err) {
                return this.respond(err)
              }

              PubRedis.publish(Constants.USER_NOTIFY_OFFER_CANCELED, JSON.stringify({
                offer: offer.toObject(),
                order: order.toObject()
              }));

              this.respond(offer)

            })
          }

          if (order.get('payment_method') === 'card' && order.get('transaction_id')) {
            RestaurantHelper.cancelPayment(order.get('transaction_id'), (err) => {
              if (err) {
                return this.respond(err)
              }
              saveOffer()
            })
          } else {
            saveOffer()
          }

        });

      });

    });

  }

}

module.exports = RestaurantOffersController;
