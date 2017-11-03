'use strict';

const Nodal = require('nodal');

class AddPushTokenToRestaurant extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017020207244361;
  }

  up() {

    return [
      this.addColumn('restaurants', 'push_token', 'string')
    ];

  }

  down() {

    return [
      this.dropColumn('restaurants', 'push_token')
    ];

  }

}

module.exports = AddPushTokenToRestaurant;
