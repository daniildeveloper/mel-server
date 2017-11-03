'use strict';

const Nodal = require('nodal');

class CreateDishes extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2016122712451457;
  }

  up() {

    return [
      this.createTable("dishes", [
        {"name":"name","type":"string"},
        {"name":"description","type":"text"},
        {"name":"avatar","type":"string"},
        {"name":"category_id","type":"int", "properties": { nullable: true }}
      ])
    ];

  }

  down() {

    return [
      this.dropTable("dishes")
    ];

  }

}

module.exports = CreateDishes;
