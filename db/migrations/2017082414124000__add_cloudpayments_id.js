'use strict';

const Nodal = require('nodal');

class AddCloudpaymentsId extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017082414124000;
  }

  up() {

    return [
      this.addColumn('restaurants', 'cloudpayments_id', 'string')
    ];

  }

  down() {

    return [
      this.dropColumn('restaurants', 'cloudpayments_id')
    ];

  }

}

module.exports = AddCloudpaymentsId;
