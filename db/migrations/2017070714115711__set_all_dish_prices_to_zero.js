'use strict';

const Nodal = require('nodal');

class SetAllDishPricesToZero extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017070714115711;
  }

  up() {

    return [
      `UPDATE dishes SET price = 0`
    ];

  }

  down() {

    return [];

  }

}

module.exports = SetAllDishPricesToZero;
