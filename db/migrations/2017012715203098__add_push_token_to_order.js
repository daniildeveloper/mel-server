'use strict';

const Nodal = require('nodal');

class AddPushTokenToOrder extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017012715203098;
  }

  up() {

    return [
      this.addColumn('orders', 'push_token', 'string')
    ];

  }

  down() {

    return [
      this.dropColumn('orders', 'push_token')
    ];

  }

}

module.exports = AddPushTokenToOrder;
