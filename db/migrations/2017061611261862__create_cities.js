'use strict';

const Nodal = require('nodal');

class CreateCities extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017061611261862;
  }

  up() {

    return [
      this.createTable("cities", [{"name":"name","type":"string"}]),
      `INSERT INTO cities (id, name) VALUES (1, 'Астана')`,
      `INSERT INTO cities (id, name) VALUES (2, 'Алматы')`,
      this.addColumn('orders', 'city_id', 'int'),
      `UPDATE orders SET city_id = 1`,
      `alter table orders add foreign key (city_id) REFERENCES cities ON DELETE SET NULL ON UPDATE CASCADE`,
    ];

  }

  down() {

    return [
      this.dropTable("cities"),
      this.dropColumn('orders', 'city_id')
    ];

  }

}

module.exports = CreateCities;
