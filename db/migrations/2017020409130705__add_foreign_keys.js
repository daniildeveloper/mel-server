'use strict';

const Nodal = require('nodal');

class AddForeignKeys extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017020409130705;
  }

  up() {

    return [
      `alter table offers add foreign key (restaurant_id) REFERENCES restaurants ON DELETE CASCADE ON UPDATE CASCADE`,
      `alter table restaurants add foreign key (admin_id) REFERENCES users ON DELETE CASCADE ON UPDATE CASCADE`
    ];

  }

  down() {

    return [
      this.dropForeignKey('offers', 'restaurants'),
      this.dropForeignKey('restaurants', 'users')
    ];

  }

}

module.exports = AddForeignKeys;
