'use strict';

const Nodal = require('nodal');

class CreateUsers extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2016122611584461;
  }

  up() {

    return [
      this.createTable('users', [
        {'name':'email','type':'string','properties': { 'unique':true }},
        {'name':'password','type':'string'},
        {'name': 'is_admin', 'type': 'boolean' }
      ])
    ];

  }

  down() {

    return [
      this.dropTable('users')
    ];

  }

}

module.exports = CreateUsers;
