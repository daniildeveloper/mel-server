'use strict';

const Nodal = require('nodal');
const User = Nodal.require('app/models/user.js');
const AuthController = Nodal.require('app/controllers/auth_controller.js');

class TelegramTokenController extends AuthController {

  get() {

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err);
      }

      if (user.get('is_admin') !== true) {
        return this.unauthorized();
      }

      User.generateRandomToken((err, token) => {

        if (err) {
          return this.respond(err)
        }

        this.respond({
          token
        })

      });

    });

  }

}

module.exports = TelegramTokenController;
