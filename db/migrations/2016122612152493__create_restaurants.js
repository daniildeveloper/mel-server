'use strict';

const Nodal = require('nodal');

class CreateRestaurants extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2016122612152493;
  }

  up() {

    return [
      this.createTable("restaurants", [
        {"name":"name","type":"string"},
        {"name":"phone","type":"string"},
        {"name":"description","type":"text"},
        {"name":"address","type":"string"},
        {"name":"website","type":"string"},
        {"name":"admin_id","type":"int"},
        {"name":"avatar","type":"string"
      }])
    ];

  }

  down() {

    return [
      this.dropTable("restaurants")
    ];

  }

}

module.exports = CreateRestaurants;
