'use strict';

const Nodal = require('nodal');

class HealthControllerController extends Nodal.Controller {

  get() {

    this.respond({
      status: 'healthy'
    });

  }

}

module.exports = HealthControllerController;
