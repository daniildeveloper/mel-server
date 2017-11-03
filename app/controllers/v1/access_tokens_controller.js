'use strict'

const Nodal = require('nodal');
const SafeCompare = require('safe-compare');
const Errors = Nodal.require('config/errors.json');
const Restaurant = Nodal.require('app/models/restaurant.js');
const AccessToken = Nodal.require('app/models/access_token.js');
const AuthController = Nodal.require('app/controllers/auth_controller.js');

class AccessTokensController extends AuthController {

    get() {

      const email = this.params.query.email

      AccessToken.verify(this.params, (err, token, user) => {

        if (err) {
          return this.respond(err)
        }

        if (!SafeCompare(email, user.get('email'))) {
          return this.respond(new Error(Errors['INVALID_TOKEN']))
        }

        Restaurant.getByUserId(user.get('id'), (err, restaurant) => {

          if (err) {
            return this.respond(err)
          }

          const json = Object.assign({}, user.toObject(), {
            access_token: token.toObject(),
            restaurant: restaurant.toObject()
          })

          this.respond(json);

        });

      });

    }

    destroy() {

      this.authorize((err, token, user) => {

        if (err) {
          return this.respond(err);
        }

        if (token.get('id') != this.params.route.id) {
          return this.badRequest();
        }

        token.destroy((err) => {

          this.respond(err || token);

        });

      });

    }

  }

  module.exports = AccessTokensController;
