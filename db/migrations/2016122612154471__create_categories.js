'use strict';

const Nodal = require('nodal');

class CreateCategories extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2016122612154471;
  }

  up() {

    return [
      this.createTable("categories", [
        {"name":"name","type":"string"},
        {"name":"avatar","type":"string"},
        {"name":"parent_id","type":"int"}
      ])
    ];

  }

  down() {

    return [
      this.dropTable("categories")
    ];

  }

}

module.exports = CreateCategories;
