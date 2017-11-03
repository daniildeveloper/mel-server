'use strict';

const Nodal = require('nodal');

class ChangeCurrencyDataTypes extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017020518542563;
  }

  up() {

    return [
      this.alterColumn('offers', 'amount', 'float'),
      this.alterColumn('offers', 'total', 'float'),
      this.alterColumn('offers', 'discount', 'float')
    ];

  }

  down() {

    return [
      this.alterColumn('offers', 'amount', 'currency'),
      this.alterColumn('offers', 'total', 'currency'),
      this.alterColumn('offers', 'discount', 'currency')
    ];

  }

}

module.exports = ChangeCurrencyDataTypes;
