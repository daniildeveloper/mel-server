'use strict';

const Nodal = require('nodal');

class StorePinCodeInString extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017020614123029;
  }

  up() {

    return [
      this.alterColumn('offers', 'pin_code', 'string')
    ];

  }

  down() {

    return [
      this.alterColumn('offers', 'pin_code', 'int')
    ];

  }

}

module.exports = StorePinCodeInString;
