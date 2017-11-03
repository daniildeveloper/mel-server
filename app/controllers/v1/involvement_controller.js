'use strict';

const Nodal = require('nodal');
const Async = require('async');
const Moment = require('moment');
const Adapter = Nodal.require('db/main.js');
const Order = Nodal.require('app/models/order.js');
const Offer = Nodal.require('app/models/offer.js');
const Relationships = Nodal.require('app/relationships.js');
const Restaurant = Nodal.require('app/models/restaurant.js');

class InvolvementController extends Nodal.Controller {

  static parsePeriod (period) {
    const now = Moment()
    const past = Moment()

    past.hours(0)
    past.seconds(0)
    past.minutes(0)
    past.millisecond(0)

    switch (period) {
      case 'today':
      break;

      case 'yesterday':
        now.hours(0)
        now.seconds(0)
        now.minutes(0)
        now.millisecond(0)

        past.subtract(1, 'days')
      break;

      case 'week':
        past.subtract(7, 'days')
      break;

      case 'month':
        past.subtract(1, 'months')
      break;

      case 'all':
        past.subtract(10, 'years')
      break;

      default:
        return null
    }

    return {
      from: past.toDate(),
      till: now.toDate()
    }
  }

  get () {
    const period = InvolvementController.parsePeriod(this.params.query.period)

    if (!period) {
      return this.badRequest('Period is not defined')
    }

    const tasks = {
      restaurants: (cb) => {
        const query = `
          SELECT * FROM restaurants
        `

        Adapter.query(query, [], cb)
      },
      restaurantsDishes: (cb) => {
        const query = `
          select array_agg(dishes.id) as dish_id, restaurant_id from dishes
          inner join categories on dishes.category_id = categories.id
          inner join restaurant_categories on categories.parent_id = restaurant_categories.category_id
          group by restaurant_id
        `

        Adapter.query(query, [ ], cb)
      },
      orders: (cb) => {
        const query = `
          SELECT * FROM orders
          WHERE
            created_at >= $1 AND
            created_at <= $2
        `

        Adapter.query(query, [ period.from, period.till ], cb)
      },
      offers: (cb) => {
        const query = `
          SELECT order_id, restaurant_id FROM offers
          WHERE
            created_at >= $1 AND
            created_at <= $2
          GROUP BY restaurant_id, order_id
        `

        Adapter.query(query, [ period.from, period.till ], cb)
      }
    }

    Async.parallel(tasks, (err, data) => {

      if (err) {
        return this.respond(err)
      }

      const { restaurants, offers, orders } = data

      if (!restaurants || restaurants.rows.length === 0) {
        return this.respond([])
      }

      const dishesMap = data.restaurantsDishes.rows.reduce((acc, v) => {
        acc[v.restaurant_id] = v.dish_id.map(Number)
        return acc
      }, {})

      const results = restaurants.rows.map((r) => {
        const restaurantDishes = dishesMap[r.id]

        const possibleOrders = (orders.rows || []).filter((o) => {
          const orderBagIds = o.client_order.map(d => d.id)
          const orderFitsBag = orderBagIds.every(d => restaurantDishes.includes(d))

          return o.city_id === r.city_id && orderFitsBag
        })

        const givvenOffers = (offers.rows || []).filter((o) => {
          return o.restaurant_id === r.id
        })

        const involvement = possibleOrders.length ?  givvenOffers.length / possibleOrders.length : 0

        return {
          name: r.name,
          city_id: r.city_id,
          involvement: involvement,
          givven_offers: givvenOffers.length,
          possible_orders: possibleOrders.length
        }
      })

      this.respond(results)
    })
  }

}

module.exports = InvolvementController;
