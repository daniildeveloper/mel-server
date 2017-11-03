'use strict';

const Nodal = require('nodal');
const City = Nodal.require('app/models/city.js');
const AuthController = Nodal.require('app/controllers/auth_controller.js');

class CityController extends AuthController {

  get() {

    City
    .query()
    .end((err, models) => {

        this.respond(err || models);

      });

  }

  show () {

    const id = this.params.route.id;

    if (!id || Number.isNaN(parseInt(id))) {
      return this.badRequest();
    }

    City
    .query()
    .where({ id: id })
    .end((err, res) => {

      if (err) {
        return this.respond(err)
      }

      this.respond(res)

    })
  }

  post() {

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err);
      }

      if (user.get('is_admin') !== true) {
        return this.unauthorized();
      }

      City.create(this.params.body, (err, model) => {

        this.respond(err || model);

      });
    });

  }

  put() {

    const id = this.params.route.id;

    if (!id || Number.isNaN(parseInt(id))) {
      return this.badRequest();
    }

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err);
      }

      if (user.get('is_admin') !== true) {
        return this.unauthorized();
      }

      City.update(id, this.params.body, (err, model) => {

        this.respond(err || model);

      });

    });

  }

  destroy () {

    const id = this.params.route.id;

    if (!id || Number.isNaN(parseInt(id))) {
      return this.badRequest();
    }

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err);
      }

      if (user.get('is_admin') !== true) {
        return this.unauthorized();
      }

      City.destroy(id, (err, model) => {

        this.respond(err || model);

      });

    });

  }

}

module.exports = CityController;
