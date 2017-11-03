'use strict';

const Nodal = require('nodal');

class AddOrderPaymentMethod extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017082412514730;
  }

  up() {

    return [
      this.addColumn('orders', 'payment_method', 'string')
    ];

  }

  down() {

    return [
      this.dropColumn('orders', 'payment_method')
    ];

  }

}

module.exports = AddOrderPaymentMethod;
