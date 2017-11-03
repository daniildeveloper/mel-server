'use strict';

const Nodal = require('nodal');

class AddLastPushNotificationsToOrders extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017031611253219;
  }

  up() {

    return [
      this.addColumn('orders', 'last_push_date', 'datetime')
    ];

  }

  down() {

    return [
      this.dropColumn('orders', 'last_push_date')
    ];

  }

}

module.exports = AddLastPushNotificationsToOrders;
