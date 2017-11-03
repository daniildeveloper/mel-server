'use strict';

const Nodal = require('nodal');
const Order = Nodal.require('app/models/order.js');
const Offer = Nodal.require('app/models/offer.js');
const Errors = Nodal.require('config/errors.json');
const Constants = Nodal.require('config/constants.js')
const Restaurant = Nodal.require('app/models/restaurant.js');
const RedisHelper = Nodal.require('app/helpers/redis_helper.js');
const RestaurantsHelper = Nodal.require('app/helpers/restaurants_helper.js');
const AuthController = Nodal.require('app/controllers/auth_controller.js');
const approveOffer = Nodal.require('app/helpers/approve_offer.js')

const PubRedis = new RedisHelper()

const returnedColumns = Offer.columns().reduceRight((memo, c) => {
  if (!Offer.isHidden(c.name)) {
    memo.unshift(c.name)
  }
  return memo;
}, [ 'restaurant' ])

class OffersController extends AuthController {

  get () {

    const hash = this.params.route.id;

    if (!hash) {
      return this.badRequest();
    }

    Order.findBy('hash', hash, (err, order) => {

      if (err) {
        return this.respond(err)
      }

      const options = {
        order_id: order.get('id'),
        approved: true,
      }

      Offer
      .query()
      .join('restaurant')
      .where(options)
      .limit(1)
      .end((err, res) => {

        if (err) {
          return this.respond(err)
        }

        this.respond(res, returnedColumns)

      })

    })

  }

  put () {

    const id = this.params.route.id

    if (!id) {
      return this.badRequest()
    }

    Offer
    .query()
    .where({ id: id })
    .end((err, res) => {

      if (err) {
        return this.respond(err)
      }

      if (res.length === 0) {
        return this.respond(new Error(Errors['COULD_NOT_FIND_OFFER']))
      }

      const offer = res.pop()

      const options = {
        id: offer.get('order_id'),
        hash: this.params.body.hash
      }

      Order
      .query()
      .where(options)
      .end((err, orders) => {

        if (err) {
          return this.respond(err)
        }

        if (!orders || !orders.length) {
          return this.respond(new Error(Errors['COULD_NOT_FIND_ORDER']))
        }

        const order = orders.pop()

        const approve = (err, res) => {
          if (err) {
            return this.respond(err)
          }
          this.respond(res)
        }

        if (order.get('payment_method') === 'card') {

          const options = {}

          if (this.params.body.cryptogram) {
            options.cryptogram = this.params.body.cryptogram
          } else if (this.params.body.token) {
            options.token = this.params.body.token
          } else {
            this.respond(new Error('cryptogram or token is required'))
          }

          RestaurantsHelper.holdPayment(offer, options, (err, result) => {
            if (err) {
              return this.respond(err)
            }

            if (result['3d']) {
              return this.respond(result)
            } else {
              Order.update(order.get('id'), {
                transaction_id: result.TransactionId
              }, (err) => {
                if (err) {
                  return this.error(err)
                }
                approveOffer(PubRedis, offer, order, (err, offer) => {
                  if (err) {
                    return this.respond(err)
                  }
                  const res = offer.toObject()
                  res.token = result.Token
                  this.respond(res)
                })
              })
            }
          })

        } else {
          approveOffer(PubRedis, offer, order, approve)
        }

      })

    })

  }

  post () {

    const hash = this.params.route.id || this.params.body.order_hash;

    if (!hash) {
      return this.badRequest();
    }

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err);
      }

      Restaurant.getByUserId(user.get('id'), (err, restaurant) => {

        if (err) {
          return this.respond(err)
        }

        Order
        .query()
        .where({ hash: hash })
        .limit(1)
        .end((err, orders) => {

          if (err) {
            return this.respond(err)
          }

          if (!orders) {
            return this.respond(new Error(Errors['COULD_NOT_FIND_ORDER']))
          }

          const order = orders.pop();

          delete this.params.body.delivery_date;

          const options = Object.assign({}, this.params.body, {
            restaurant_id: restaurant.get('id'),
            pin_code: Offer.generatePinCode(),
            order_id: order.get('id'),
            approved: false,
            withdrew: false
          });

          Offer.create(options, (err, model) => {

            if (err) {
              return this.respond(err)
            }

            if (order.get('push_token')) {
              PubRedis.publish(Constants.PUSH_NEW_OFFER, JSON.stringify({
                restaurant: restaurant.toObject(),
                token: order.get('push_token'),
                offer: model.toObject(),
                order: order.toObject()
              }));
            }

            this.respond(model);

          });

        })

      })

    })
  }

}

module.exports = OffersController;
