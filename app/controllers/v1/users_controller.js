'use strict';

const Nodal = require('nodal');
const Async = require('async');
const User = Nodal.require('app/models/user.js');
const Errors = Nodal.require('config/errors.json');
const Restaurant = Nodal.require('app/models/restaurant.js');
const AccessToken = Nodal.require('app/models/access_token.js');
const AuthController = Nodal.require('app/controllers/auth_controller.js')

class V1UsersController extends AuthController {

  get() {

    const email = this.params.query.email;
    const password = this.params.query.password;

    if (!email || !password) {
      return this.respond(new Error(Errors['INVALID_CREDENTIALS']))
    }

    User.findBy('email', email.toLowerCase(), (err, model) => {

      if (err || !model) {
        return this.respond(new Error(Errors['INVALID_CREDENTIALS']))
      }

      const tasks = {
        restaurant: (cb) => {
          Restaurant.getByUserId(model.get('id'), cb)
        },

        token: (cb) => {
          AccessToken.login(model, password, cb)
        }
      }

      Async.parallel(tasks, (err, data) => {

        if (err) {
            return this.respond(err);
        }


        const json = Object.assign({}, model.toObject(), {
          access_token: data.token.toObject(),
          restaurant: data.restaurant.toObject()
        });

        this.respond(json)

      })

    });
  }

  put() {

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err);
      }

      if (user.get('is_admin') !== true) {
        return this.unauthorized();
      }

      delete this.params.body.is_admin;

      User.update(this.params.route.id, this.params.body, (err, model) => {

        this.respond(err || model);

      });

    });

  }

  post() {

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err);
      }

      if (user.get('is_admin') !== true) {
        return this.unauthorized();
      }

      User.create(this.params.body, (err, model) => {

        this.respond(err || model);

      });

    });

  }

}

module.exports = V1UsersController;
