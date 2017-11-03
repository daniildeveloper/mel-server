'use strict';

const Nodal = require('nodal');

class AddTransactionIdToOrders extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017090210194195;
  }

  up() {

    return [
      this.addColumn('orders', 'transaction_id', 'int')
    ];

  }

  down() {

    return [
      this.dropColumn('orders', 'transaction_id')
    ];

  }

}

module.exports = AddTransactionIdToOrders;
