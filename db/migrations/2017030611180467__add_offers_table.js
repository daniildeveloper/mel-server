'use strict';

const Nodal = require('nodal');

class AddOffersTable extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017030611180467;
  }

  up() {

    return [
      this.createTable('offers_table', [
        {name:'restaurant_id',type:'int', properties: { unique: true }},
        {name:'period_1_count',type:'int'},
        {name:'period_2_count',type:'int'},
        {name:'period_3_count',type:'int'},
        {name:'period_4_count',type:'int'},
        {name:'period_5_count',type:'int'},
        {name:'period_6_count',type:'int'}
      ])
    ];

  }

  down() {

    return [
      this.dropTable('offers_table')
    ];

  }

}

module.exports = AddOffersTable;
