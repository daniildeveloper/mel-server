'use strict';

const Nodal = require('nodal')
const Async = require('async')
const Adapter = Nodal.require('db/main.js')
const City = Nodal.require('app/models/city.js');
const Restaurant = Nodal.require('app/models/restaurant.js');
const Moment = require('moment')
const Constants = Nodal.require('config/constants.js')
const RedisHelper = Nodal.require('app/helpers/redis_helper.js')

const PubRedis = new RedisHelper()

// Withdraw commission from restaurant for approved offer
class WithdrawCommission {

  getComission (deliveryDate, utcOffset) {
    const date = Moment(deliveryDate).utcOffset(parseInt(utcOffset))
    const hours = date.hours()

    if (hours >= 7 && hours < 11) {
      return 400
    } else if (hours >= 11 && hours < 16) {
      return 200
    } else if (hours >= 16 && hours < 18) {
      return 400
    } else if (hours >= 18 && hours < 22) {
      return 200
    } else if (hours >= 22 && hours <= 23) {
      return 300
    } else if (hours >= 0 && hours < 7) {
      return 100
    }
  }

  async exec (...args) {
    const callback = args.pop()
    console.log('WithdrawCommission task executing')

    let approvedFrom = new Date()
    approvedFrom.setMinutes(approvedFrom.getMinutes() - 20)
    approvedFrom = approvedFrom.toISOString()

    const query = `
    SELECT
      offers.*,
      orders.city_id
    FROM
      offers
    LEFT JOIN
      orders ON orders.id = offers.order_id
    WHERE
      offers.canceled = false AND
      offers.withdrew = false AND
      offers.approved = true AND
      offers.approved_at < '${approvedFrom}'
    `;

    Adapter.query(query, [], (err, offers) => {
      if (err) {
        console.error(err)
        return callback()
      }
      if (!offers || offers.rows.length === 0) {
        console.log('No offers for withdraw')
        return callback()
      }
      const exclude = (offer, cb) => {
        Adapter.query(`UPDATE offers SET withdrew = true WHERE id = ${offer.id}`, [], (err, offers) => {
          if (err) {
            return cb(err)
          }
          console.log(`Offer ID=${offer.id} processed`)
          cb()
        })
      }
      const tasks = offers.rows.map((offer) => {
        return (cb) => {
          if (offer.amount < 2000) {
            return exclude(offer, cb)
          }
          City.find(offer.city_id, (error, city) => {
            const commission = this.getComission(offer.delivery_date, city.get('utc_offset'))

            Restaurant.find(offer.restaurant_id, (err, restaurant) => {
              if (err) {
                return cb(err)
              }
              const withdrawnBill = restaurant.get('bill') - commission
              Restaurant.update(restaurant.get('id'), {
                bill: withdrawnBill
              }, (err, restaurant) => {
                if (err) {
                  return cb(err)
                }
                if (withdrawnBill <= 0) {
                  PubRedis.publish(Constants.TELEGRAM_NOTIFY_NEGATIVE_BALANCE, JSON.stringify({
                    restaurant: restaurant.toObject()
                  }))
                }
                return exclude(offer, cb)
              })
            })
          })
        }
      })
      Async.parallel(tasks, callback);
    })
  }

}

module.exports = WithdrawCommission;
