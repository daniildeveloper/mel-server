'use strict';

const Nodal = require('nodal');

class AddExpirationColumns extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017020606021526;
  }

  up() {

    return [
      this.addColumn('orders', 'expired', 'boolean', {
        defaultValue: 'false'
      })
    ];

  }

  down() {

    return [
      this.dropColumn('orders', 'expired')
    ];

  }

}

module.exports = AddExpirationColumns;
