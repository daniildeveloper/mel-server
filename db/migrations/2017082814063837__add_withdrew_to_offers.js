'use strict';

const Nodal = require('nodal');

class AddWithdrewToOffers extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017082814063837;
  }

  up() {

    return [
      this.addColumn('offers', 'withdrew', 'boolean')
    ];

  }

  down() {

    return [
      this.dropColumn('offers', 'withdrew')
    ];

  }

}

module.exports = AddWithdrewToOffers;
