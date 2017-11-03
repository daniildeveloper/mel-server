'use strict';

const Nodal = require('nodal');

class AddRestaurantBill extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017081708213620;
  }

  up() {

    return [
      this.addColumn('restaurants', 'bill', 'float'),
      'ALTER TABLE restaurants ALTER COLUMN bill SET DEFAULT 0',
      'UPDATE restaurants SET bill=0'
    ];

  }

  down() {

    return [
      this.dropColumn('restaurants', 'bill')
    ];

  }

}

module.exports = AddRestaurantBill;
