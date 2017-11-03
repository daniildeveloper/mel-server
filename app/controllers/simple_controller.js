'use strict';

const Nodal = require('nodal');
const Errors = Nodal.require('config/errors.json');

class SimpleController extends Nodal.Controller {

  respond(data,arrInterface) {

    if (data instanceof Error && data.details && data.details._query) {
      return Nodal.Controller.prototype.respond.call(this, new Error(Errors['DATABASE_ERROR']))
    }

    return Nodal.Controller.prototype.respond.call(this, data, arrInterface)
  }

}

module.exports = SimpleController;
