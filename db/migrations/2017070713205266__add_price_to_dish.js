'use strict';

const Nodal = require('nodal');

class AddPriceToDish extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017070713205266;
  }

  up() {

    return [
      this.addColumn('dishes', 'price', 'int')
    ];

  }

  down() {

    return [
      this.dropColumn('dishes', 'price')
    ];

  }

}

module.exports = AddPriceToDish;
