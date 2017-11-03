'use strict';

const Nodal = require('nodal');
const Async = require('async');
const Adapter = Nodal.require('db/main.js');
const Order = Nodal.require('app/models/order.js');
const Constants = Nodal.require('config/constants.js');
const RedisHelper = Nodal.require('app/helpers/redis_helper.js');

const PubRedis = new RedisHelper()

const isProduction = process.env.NODE_ENV === 'production'

class ExpireNoOffers {

  exec(a,b, callback) {

    const interval = isProduction ? '20 minutes' : '1 minutes'

    const query = `
      SELECT * FROM
        ${Order.table()}
      WHERE
        active = true AND
        expired <> true AND
        delivered <> true AND
        updated_at < current_timestamp - interval '${interval}'
    `

    Adapter.query(query, [], (err, res) => {
      if (err) {
        console.error(err)
        return callback();
      }

      if (!res || res.rows.length === 0) {
        return callback()
      }

      const tasks = res.rows.map((order) => {
        return (cb) => {

          const query = `
            SELECT
              count(*)
            FROM
              offers
            WHERE
              order_id = $1 AND
              canceled = false
          `

          Adapter.query(query, [ order.id ], (err, res) => {
            if (err) {
              return cb(err)
            }

            if (!res || !res.rows) {
              return cb()
            }

            const count = parseInt(res.rows[0].count)

            if (count === 0) {

              const query = `
               UPDATE
                 orders
               SET
                 expired = true,
                 active = false,
                 updated_at = current_timestamp
               WHERE
                 id = $1
              `

              Adapter.query(query, [ order.id ], (err, res) => {

                if (err) {
                  return cb(err)
                }

                if (order.push_token) {
                  PubRedis.publish(Constants.USER_NOTIFY_NO_OFFERS, JSON.stringify({
                    order: order
                  }))
                }

              })

            }
          })
        }
      })

      Async.parallel(tasks, callback);
    })

  }

}

module.exports = ExpireNoOffers;
