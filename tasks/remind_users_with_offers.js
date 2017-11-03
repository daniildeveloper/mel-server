'use strict';

const Nodal = require('nodal');
const Async = require('async');
const Adapter = Nodal.require('db/main.js');
const Constants = Nodal.require('config/constants.js');
const RedisHelper = Nodal.require('app/helpers/redis_helper.js');

const PubRedis = new RedisHelper()

class RemindUsersWithOffers {

  exec(a,b, callback) {

    const query = `
      UPDATE
        orders
      SET
        last_push_date = current_timestamp
      WHERE
        active = true AND
        expired <> true AND
        push_token IS NOT null AND
        last_push_date < current_timestamp - interval '15 minutes'
      RETURNING *
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
            SELECT count(*) from offers WHERE order_id = $1
          `

          Adapter.query(query, [ order.id ], (err, res) => {
            if (err) {
              return cb(err)
            }

            if (!res || !res.rows) {
              return cb()
            }

            const count = parseInt(res.rows[0].count)

            if (count > 0) {
              PubRedis.publish(Constants.USER_NOTIFY_NEW_OFFERS, JSON.stringify({
                order: order
              }));
            }
          })
        }
      })

      Async.parallel(tasks, callback);
    })

  }

}

module.exports = RemindUsersWithOffers;
