'use strict';

const Nodal = require('nodal');

class CreateRestaurantCategories extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2016122612160774;
  }

  up() {

    return [
      this.createTable("restaurant_categories", [
        {"name":"restaurant_id","type":"int"},
        {"name":"category_id","type":"int"}
      ])
    ];

  }

  down() {

    return [
      this.dropTable("restaurant_categories")
    ];

  }

}

module.exports = CreateRestaurantCategories;
