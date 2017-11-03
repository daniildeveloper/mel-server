'use strict';

const Nodal = require('nodal');

class AddForeignKeys extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017081416083066;
  }

  up() {

    return [
      `delete from offers where order_id not in (
        select id from orders
      )`,

      `delete from restaurant_categories where restaurant_id not in (
        select id from restaurants
      )`,

      `delete from restaurant_categories where restaurant_id not in (
        select id from restaurants
      )`,

      `alter table offers add foreign key (order_id) REFERENCES orders ON DELETE CASCADE ON UPDATE CASCADE`,
      `alter table access_tokens add foreign key (user_id) REFERENCES users ON DELETE CASCADE ON UPDATE CASCADE`,
      `alter table categories add foreign key (parent_id) REFERENCES categories ON DELETE CASCADE ON UPDATE CASCADE`,
      `alter table restaurant_categories add foreign key (restaurant_id) REFERENCES restaurants ON DELETE CASCADE ON UPDATE CASCADE`,
      `alter table restaurant_categories add foreign key (category_id) REFERENCES categories ON DELETE CASCADE ON UPDATE CASCADE`
    ];

  }

  down() {

    return [];

  }

}

module.exports = AddForeignKeys;
