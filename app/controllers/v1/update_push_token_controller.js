'use strict';

const Nodal = require('nodal');
const Restaurant = Nodal.require('app/models/restaurant.js');
const AuthController = Nodal.require('app/controllers/auth_controller.js');

class UpdatePushTokenController extends AuthController {

  put() {

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err)
      }

      Restaurant.getByUserId(user.get('id'), (err, restaurant) => {

        if (err) {
          return this.respond(err)
        }

        if (restaurant.get('push_token') === this.params.body.push_token) {
          return this.respond(restaurant)
        }

        restaurant.set('push_token', this.params.body.push_token)

        restaurant.save((err, model) => {

          if (err) {
            return this.respond(err)
          }

          this.respond(model)

        })

      })

    })

  }

}

module.exports = UpdatePushTokenController;
