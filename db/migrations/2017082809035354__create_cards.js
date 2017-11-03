'use strict';

const Nodal = require('nodal');

class CreateCards extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017082809035354;
  }

  up() {

    return [
      this.createTable('cards', [
        {'name':'name','type':'text'},
        {'name':'hash','type':'text'},
        {'name':'cryptogram','type':'text'}
      ]),
      this.addColumn('orders', 'card_hash', 'string')
    ];

  }

  down() {

    return [
      this.dropTable('cards'),
      this.dropColumn('orders', 'card_hash')
    ];

  }

}

module.exports = CreateCards;
