'use strict';

const Nodal = require('nodal');

class AddCancelFieldToOffer extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017071809375059;
  }

  up() {

    return [
      this.addColumn('offers', 'canceled', 'boolean'),
      `ALTER TABLE "offers" ALTER COLUMN "canceled" SET DEFAULT 'false'`
    ];

  }

  down() {

    return [
      this.dropColumn('offers', 'canceled')
    ];

  }

}

module.exports = AddCancelFieldToOffer;
