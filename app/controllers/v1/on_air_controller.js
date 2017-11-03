'use strict';

const Nodal = require('nodal');
const Order = Nodal.require('app/models/order.js');
const Restaurant = Nodal.require('app/models/restaurant.js');
const AuthController = Nodal.require('app/controllers/auth_controller.js');
const RestaurantsHelper = Nodal.require('app/helpers/restaurants_helper.js');

class OnAirController extends AuthController {

  get () {

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err)
      }
      RestaurantsHelper.getCategoriesByAdmin(user.get('id'), (err, categories) => {

        if (err) {
          return this.respond(err)
        }

        if (categories.length === 0) {
          return this.respond([])
        }

        Restaurant.getByUserId(user.get('id'), (err, restaurant) => {

          if (err) {
            return this.respond(err)
          }

          Order.findByCityAndCategories(
            restaurant.get('city_id'),
            categories,
            restaurant.get('cloudpayments_id') ? null : ['cash'],
            (err, res) => {

            this.respond(err || res)

          })

        })

      })

    });

  }

}

module.exports = OnAirController;
