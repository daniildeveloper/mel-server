'use strict';

const Nodal = require('nodal');

class AddCloudpaymentsPassword extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017092114270258;
  }

  up() {

    return [
      this.addColumn('restaurants', 'cloudpayments_password', 'string')
    ];

  }

  down() {

    return [
      this.dropColumn('restaurants', 'cloudpayments_password')
    ];

  }

}

module.exports = AddCloudpaymentsPassword;
