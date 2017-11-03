'use strict';

const Nodal = require('nodal');
const Adapter = Nodal.require('db/main.js');
const Order = Nodal.require('app/models/order.js');

class ExpireOldOrders {

  exec(a,b, callback) {

    const isProduction = process.env.NODE_ENV === 'production'

    const interval = isProduction ? '5 hours' : '5 minutes'

    const query = `
      UPDATE
        ${Order.table()}
      SET
        expired = true,
        active = false
      WHERE
        expired = false AND
        delivered = false AND
        created_at < current_timestamp - interval '${interval}';
    `

    Adapter.query(query, [], (err, res) => {
      if (err) {
        console.error(err)
      }
      callback();
    })

  }

}

module.exports = ExpireOldOrders;
