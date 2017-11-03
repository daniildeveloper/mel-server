'use strict';

import rating from 'rating';

const Rating = require('rating');
const Nodal = require('nodal');
const Crypto = require('crypto');
const Adapter = Nodal.require('db/main.js');
const Dish = Nodal.require('app/models/dish.js');
const Errors = Nodal.require('config/errors.json');
const Category = Nodal.require('app/models/category.js');

const isProduction = process.env.NODE_ENV === 'production'

class Order extends Nodal.Model {

  beforeSave(callback) {

    if (!this.get('hash')) {
      this.__safeSet__('hash', Order.generateHash())
    }

    if (!this.get('date')) {
      this.__safeSet__('date', new Date())
    }

    if (!this.get('last_push_date')) {
      this.__safeSet__('last_push_date', new Date())
    }

    Order.getBagCategories(this.get('client_order'), (err, categories) => {

      if (err) {
        return callback(err)
      }

      this.__safeSet__('categories', categories)

      callback()

    })

  }

  static defaults (params)  {
    const result = Object.assign({}, params)

    if (isProduction) {
      Object.assign(result, {
        city_id: params.city_id || 1
      })
    }

    return result
  }

  static findByCityAndCategories (cityId, categories = [], paymentMethods = null, cb = function () {}) {

    if (!cityId || Number.isNaN(parseInt(cityId))) {
      return cb(new Error(Errors['CITY_COULD_NOT_BE_NULL']))
    }

    if (categories.length === 0) {
      return cb(new Error(Errors['NO_CATEGORY_TO_SEARCH']))
    }

    let paymentMethodsCond = '';
    if (paymentMethods) {
      paymentMethods = paymentMethods.map(v => `'${v}'`)
      paymentMethodsCond = 'AND payment_method IN (' + paymentMethods.join(',') + ')'
    }

    const query = `
      SELECT
        *
      FROM
        ${Order.table()}
      WHERE
        active = true AND
        expired = false AND
        delivered = false AND
        categories <@ ARRAY[${categories.join(',')}]::bigint[] AND
        city_id = $1
        ${paymentMethodsCond}
      ORDER BY
        created_at DESC
    `

    Adapter.query(query, [ cityId ], (err, res) => {

      if (err) {
        return cb(err)
      }

      cb(null, res.rows)

    })

  }

  static getBagCategories (bag = [], cb = function () {}) {
    if (bag instanceof Array !== true) {
      return cb(new Error(Errors['BAG_IS_NOT_OKAY']))
    }

    const ids = bag.map(i => i.id)

    const query = `
      SELECT
        DISTINCT parent_id
      FROM
        categories
      WHERE id IN (
        SELECT
          DISTINCT category_id
        FROM
          ${Dish.table()}
        WHERE
          id IN (${ids.join(',')})
      )
    `

    Adapter.query(query, [], (err, res) => {

      if (err) {
        return cb(err)
      }

      return cb(null, res.rows.map(i => i.parent_id))

    })

  }

  static getDetails(id, cb = function () {}) {

    Order.find(id, (err, order) => {

      if (err) {
        return cb(err)
      }

      const bag = order.get('client_order')

      const query = `
      SELECT
        dishes.id,
        dishes.name,
        cc.name as cc_name,
        cp.name as cp_name
      FROM ${Dish.table()}
        LEFT JOIN ${Category.table()} cc ON dishes.category_id = cc.id
        LEFT JOIN ${Category.table()} cp ON cc.parent_id = cp.id
      WHERE dishes.id IN (${bag.map(i => i.id).join(',')})`

      Adapter.query(query, [], (err, res) => {

        if (err) {
          return cb(err)
        }

        const bagInfo = res.rows.reduce((memo, r) => {
          memo[r.id] = r
          return memo
        }, {})

        const dishes =
        bag
        .map(i => `${i.count}шт x ${bagInfo[ i.id ].name} (${bagInfo[ i.id ].cp_name}, ${bagInfo[ i.id ].cc_name})`)
        .join(' \n ')

        const orderParam = []
        if (order.get('comment')) {
          orderParam.push(['Комментарий', order.get('comment')])
        }
        if (order.get('rating')) {
          orderParam.push(['Оценка', order.get('rating')])
        }
        if (order.get('client_address')) {
          orderParam.push(['Адрес', order.get('client_address')])
        }
        if (order.get('client_phone')) {
          orderParam.push(['Телефон', order.get('client_phone')])
        }
        if (order.get('client_name')) {
          orderParam.push(['Имя', order.get('client_name')])
        }

        const orderInfo = orderParam.map(i => `${i[0]}: ${i[1]}`).join('\n')

        return cb(null, `${dishes} \n${orderInfo}`)

      })

    })
  }

  static getAveragePrice(bag = [], cb = function () {}) {
    const ids = bag.map((item) => {
      return item.id
    });

    const query = `
      SELECT
        id, price
      FROM
        ${Dish.table()}
      WHERE
        id IN (${ids.join(',')})
    `

    Adapter.query(query, [ ], (err, res) => {

      if (err) {
        return cb(err)
      }

      if (!res.rows.length) {
        return cb(new Error('Dishes not found'))
      }

      const priceMap = res.rows.reduce((acc, row) => {
        acc[row.id] = row.price
        return acc
      }, {})

      const price = bag.reduce((total, item) => {
        const price = priceMap[item.id]

        if (!price) {
          return total
        }

        total += item.count * parseInt(price)

        return total
      }, 0)

      return cb(null, price)

    })
  }

  static checkBag (bag = [], cb = function () {}) {
    if (!bag) {
      return cb(null, false)
    }

    const bagIsOkay = bag.every((item) => {
      const id = item['id']
      const count = item['count']
      return id && count && id > 0 && count > 0;
    });

    if (!bagIsOkay) {
      return cb(null, false)
    }

    const ids = bag.map(i => i.id)

    const query = `
      SELECT
        count(*)
      FROM
        ${Dish.table()}
      WHERE
        id IN (${ids.join(',')})
    `

    Adapter.query(query, [], (err, res) => {

      if (err) {
        return cb(err)
      }

      return cb(null, res.rows.pop().count === ids.length)

    })

  }

  static generateHash() {
    return Crypto
      .createHmac('md5', Crypto.randomBytes(256).toString())
      .digest('hex');
  }

}

Order.setDatabase(Nodal.require('db/main.js'));
Order.setSchema(Nodal.my.Schema.models.Order);

Order.validates('client_address', Errors['ORDER_ADDRESS_NOT_DEFINED'], v => v && v.toString().length > 0);

Order.verifies(Errors['BAG_IS_NOT_OKAY'], (client_order, callback) => {
  Order.checkBag(client_order, (err, bagIsOkay) => {
    return callback(err || bagIsOkay)
  })
});

Order.hides('categories')
Order.hides('last_push_date')

module.exports = Order;
