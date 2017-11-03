'use strict';

const Nodal = require('nodal');

class CleanupOffersTable extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017081110104670;
  }

  up() {

    return [
      `
        delete from offers where id in (
          select id from offers where order_id not in (
            select id from orders
          )
        )
      `
    ];

  }

  down() {

    return [];

  }

}

module.exports = CleanupOffersTable;
