'use strict';

const Nodal = require('nodal');

class CreateOrders extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2016122712442195;
  }

  up() {

    return [
      this.createTable("orders", [
        {"name":"hash","type":"string", "properties": { nullable: false, unique: true }},
        {"name":"client_name","type":"string"},
        {"name":"client_phone","type":"string"},
        {"name":"client_address","type":"string", "properties": { nullable: false }},
        {"name":"client_order","type":"json"},
        {"name":"comment","type":"text"},
        {"name":"date","type":"datetime"},
        {"name":"categories","type":"int", "properties": { nullable: false, array: true }},
        {"name":"active","type":"boolean", "properties": { nullable: false }},
        {"name":"delivered","type":"boolean", "properties": { nullable: false }}
      ])
    ];

  }

  down() {

    return [
      this.dropTable("orders")
    ];

  }

}

module.exports = CreateOrders;
