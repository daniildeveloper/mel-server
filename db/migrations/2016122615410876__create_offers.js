'use strict';

const Nodal = require('nodal');

class CreateOffers extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2016122615410876;
  }

  up() {

    return [
      this.createTable("offers", [
        {"name":"restaurant_id","type":"int"},
        {"name":"order_id","type":"int"},
        {"name":"amount","type":"currency"},
        {"name":"delivery_time","type":"time"},
        {"name":"delivery_date","type":"datetime"},
        {"name":"comment","type":"text"},
        {"name":"pin_code","type":"int"},
        {"name":"approved","type":"boolean"}
      ])
    ];

  }

  down() {

    return [
      this.dropTable("offers")
    ];

  }

}

module.exports = CreateOffers;
