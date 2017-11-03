'use strict';

const Nodal = require('nodal');

class AddUtcOffsetToCities extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017082814071558;
  }

  up() {

    return [
      this.addColumn('cities', 'utc_offset', 'int'),
      'UPDATE cities SET utc_offset = 6 WHERE id = 1',
      'UPDATE cities SET utc_offset = 6 WHERE id = 2'
    ];

  }

  down() {

    return [
      this.dropColumn('cities', 'utc_offset')
    ];

  }

}

module.exports = AddUtcOffsetToCities;
