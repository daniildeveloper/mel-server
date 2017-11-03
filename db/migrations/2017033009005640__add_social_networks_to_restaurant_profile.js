'use strict';

const Nodal = require('nodal');

class AddSocialNetworksToRestaurantProfile extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017033009005640;
  }

  up() {

    return [
      this.addColumn('restaurants', 'facebook', 'string'),
      this.addColumn('restaurants', 'instagram', 'string')
    ];

  }

  down() {

    return [
      this.dropColumn('restaurants', 'facebook', 'string'),
      this.dropColumn('restaurants', 'instagram', 'string')
    ];

  }

}

module.exports = AddSocialNetworksToRestaurantProfile;
