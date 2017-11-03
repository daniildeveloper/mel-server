'use strict';

const Nodal = require('nodal')
const Async = require('async')
const Moment = require('moment')
const Order = Nodal.require('app/models/order.js')
const Offer = Nodal.require('app/models/offer.js')
const Relationships = Nodal.require('app/relationships.js')
const RestaurantHelper = Nodal.require('app/helpers/restaurants_helper.js')

class TimeoutPayment {

  exec (...args) {
    const callback = args.pop()

    Offer
      .query()
      .join('order')
      .where({
        approved: true,
        approved_at__lte: Moment().subtract(1, 'hour').toDate(),
        order__delivered: false,
        order__active: true
      })
      .end((err, offers) => {
        if (err) {
          console.error(err)
          return callback()
        }

        if (offers.length === 0) {
          console.log('No timeout payments')
          return callback()
        }

        const tasks = offers.map((offer) => {
          return (cb) => {
            RestaurantHelper.withdrawTimeoutPayment(offer, () => {
              const options = {
                delivered: true,
                active: false
              }

              Order.update(offer.get('order_id'), options, (err) => {
                if (err) {
                  return cb(err)
                }
                console.log(`Order ID=${offer.get('order_id')} payment timeout`)
                cb()
              })
            })
          }
        })

        Async.parallel(tasks, callback);
      })
  }

}

module.exports = TimeoutPayment