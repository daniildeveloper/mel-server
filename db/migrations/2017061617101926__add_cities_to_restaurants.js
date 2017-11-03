'use strict';

const Nodal = require('nodal');

class AddCitiesToRestaurants extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017061617101926;
  }

  up() {

    return [
      this.addColumn('restaurants', 'city_id', 'int'),
      `UPDATE restaurants SET city_id = 1`,
      `ALTER TABLE restaurants ADD FOREIGN KEY (city_id) REFERENCES cities ON DELETE SET NULL ON UPDATE CASCADE`,
    ];

  }

  down() {

    return [
      this.dropColumn('restaurants', 'city_id')
    ];

  }

}

module.exports = AddCitiesToRestaurants;
