'use strict';

const Nodal = require('nodal');

class AddForeignKeysToCategoriesAndDishes extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017011919161404;
  }

  up() {

    return [
      `alter table dishes add foreign key (category_id) REFERENCES categories ON DELETE SET NULL ON UPDATE CASCADE`,
    ];

  }

  down() {

    return [
      this.dropForeignKey('dishes', 'categories')
    ];

  }

}

module.exports = AddForeignKeysToCategoriesAndDishes;
