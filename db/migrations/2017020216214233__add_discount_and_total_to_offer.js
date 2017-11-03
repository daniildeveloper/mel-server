'use strict';

const Nodal = require('nodal');

class AddDiscountAndTotalToOffer extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017020216214233;
  }

  up() {

    return [
      this.addColumn('offers', 'total', 'currency'),
      this.addColumn('offers', 'discount', 'currency')
    ];

  }

  down() {

    return [
      this.dropColumn('offers', 'total'),
      this.dropColumn('offers', 'discount')
    ];

  }

}

module.exports = AddDiscountAndTotalToOffer;
