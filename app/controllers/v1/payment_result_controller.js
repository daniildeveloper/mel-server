'use strict';

const Nodal = require('nodal');
const Axios = require('axios')
const Errors = Nodal.require('config/errors.json')
const Offer = Nodal.require('app/models/offer.js')
const Order = Nodal.require('app/models/order.js')
const Restaurant = Nodal.require('app/models/restaurant.js')
const RedisHelper = Nodal.require('app/helpers/redis_helper.js')
const approveOffer = Nodal.require('app/helpers/approve_offer.js')
const payment3ds = Nodal.require('app/helpers/payment3ds_helper.js')

const PubRedis = new RedisHelper()

const getLink = function (link) {
  const prefix = process.env.BASE_URL
  return `${prefix}/payment_result/${link}`
}

class PaymentResultController extends Nodal.Controller {

  get () {

    if (this.params.route.result === 'fail') {
      return this.respond({
        valid: false
      })
    } else if (this.params.route.result === 'success') {
      return this.respond({
        valid: true,
        token: this.params.query.token
      })
    } else {
      return this.badRequest()
    }

  }

  post () {

    const body = this.params.body

    if (!body || !body.MD || !body.PaRes) {
      return this.badRequest()
    }

    const offerId = this.params.route.offerId
    const orderHash = this.params.route.orderHash

    if (!orderHash) {
      return this.render('Order hash is not defined')
    }

    if (!offerId) {
      return this.render('Offer id is not defined')
    }

    const options = {
      id: offerId
    }

    Offer
      .query()
      .where(options)
      .end((err, offers) => {

        if (err) {
          return this.render(err.toString())
        }

        if (!offers || !offers.length) {
          return this.respond(new Error(Errors['COULD_NOT_FIND_OFFER']))
        }

        const offer = offers.pop()

        Order.find(offer.get('order_id'), (err, order) => {

          if (err) {
            return this.render(err.toString())
          }

          Restaurant.find(offer.get('restaurant_id'), (error, restaurant) => {

            if (err) {
              return this.render(err.toString())
            }

            if (order.get('hash') !== orderHash) {
              return this.render('Wrong order hash')
            }

            payment3ds(
              restaurant.get('cloudpayments_id'),
              restaurant.get('cloudpayments_password'),
              body,
              (result) => {
                approveOffer(PubRedis, offer, order, (err) => {
                  if (err) {
                    return this.render(err.toString())
                  }
                  Order.update(order.get('id'), {
                    transaction_id: result.TransactionId
                  }, (err) => {
                    if (err) {
                      return this.render(err.toString())
                    }
                    return this.redirect(getLink(`${offerId}/${orderHash}/success?token=${result.Token}`))
                  })
                })
              },
              () => {
                this.redirect(getLink(`${offerId}/${orderHash}/fail`))
              }
            )

          })

        })

      })

  }

}

module.exports = PaymentResultController;
