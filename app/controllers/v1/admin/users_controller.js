'use strict';

const Nodal = require('nodal');
const User = Nodal.require('app/models/user.js');
const AuthController = Nodal.require('app/controllers/auth_controller.js')

class AdminUsersController extends AuthController {

  index() {

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err);
      }

      if (user.get('is_admin') !== true) {
        return this.unauthorized();
      }

      User.query()
      .where(this.params.query)
      .end((err, models) => {

        this.respond(err || models);

      });

    });

  }

  show() {

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err);
      }

      if (user.get('is_admin') !== true) {
        return this.unauthorized();
      }

      User.find(this.params.route.id, (err, model) => {

        this.respond(err || model);

      });

    });

  }

  create() {

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

  update() {

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err);
      }

      if (user.get('is_admin') !== true) {
        return this.unauthorized();
      }

      User.update(this.params.route.id, this.params.body, (err, model) => {

        this.respond(err || model);

      });

    });

  }

  destroy() {

    User.destroy(this.params.route.id, (err, model) => {

      this.respond(err || model);

    });

  }

}

module.exports = AdminUsersController;
