'use strict';

const Nodal = require('nodal');

class AddApprovedAtColumnToOffer extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017071811583151;
  }

  up() {

    return [
      this.addColumn('offers', 'approved_at', 'datetime')
    ];

  }

  down() {

    return [
      this.dropColumn('offers', 'approved_at')
    ];

  }

}

module.exports = AddApprovedAtColumnToOffer;
