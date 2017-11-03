'use strict';

const Nodal = require('nodal');
const Offer = Nodal.require('app/models/offer.js');
const Order = Nodal.require('app/models/order.js');
const Errors = Nodal.require('config/errors.json');
const Constants = Nodal.require('config/constants.js');
const RedisHelper = Nodal.require('app/helpers/redis_helper.js');
const RestaurantsHelper = Nodal.require('app/helpers/restaurants_helper.js');

const PubRedis = new RedisHelper()

const offersColumns = Offer.columns().reduceRight((memo, c) => {
  memo.unshift(c.name)
  return memo
}, [ 'restaurant' ]);


class CheckoutController extends Nodal.Controller {

  post() {

    const id = this.params.route.id;

    if (!id || Number.isNaN(parseInt(id))) {
      return this.badRequest();
    }

    const options = {
      id: id,
      pin_code: this.params.body.pin_code
    }

    Offer
    .query()
    .where(options)
    .join('restaurant')
    .end((err, res) => {

      if (err || res.length === 0) {
        return this.respond(new Error(Errors['PIN_CHECK_FAILED']))
      }

      const offer = res.pop()

      const discount = RestaurantsHelper.getDiscount(offer)
      const total = offer.get('amount') - offer.get('amount') * discount;

      offer.set('total', total)
      offer.set('discount', discount)

      offer.save((err, model) => {

        if (err) {
          return this.respond(err)
        }

        Order.update(offer.get('order_id'), { delivered: true, active: false }, (err, order) => {

          if (err) {
            return this.respond(err)
          }

          const checkout = () => {
            PubRedis.publish(Constants.TELEGRAM_NOTIFY_DELIVERED, JSON.stringify({
              offer: offer.toObject(),
              order: order.toObject()
            }));

            this.respond(model, offersColumns)
          }

          if (order.get('payment_method') === 'card') {
            RestaurantsHelper.withdrawPayment(offer, (err) => {
              if (err) {
                return this.respond(err)
              }
              checkout()
            })
          } else {
            checkout()
          }

        })

      })

    })

  }

}

module.exports = CheckoutController;
