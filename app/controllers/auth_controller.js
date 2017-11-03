'use strict';

const Nodal = require('nodal');
const AccessToken = Nodal.require('app/models/access_token.js');
const SimpleController = Nodal.require('app/controllers/simple_controller.js');

class AuthController extends SimpleController {

  authorize(callback) {

    this.setHeader('Pragma', 'no-cache');
    this.setHeader('Cache-Control', 'no-store');

    AccessToken.verify(this.params, (err, token, user) => {

      if (err) {
        return callback(err)
      }

      callback(null, token, user)

    });

  }

}

module.exports = AuthController;
