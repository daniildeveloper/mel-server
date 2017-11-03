'use strict';

const Nodal = require('nodal');

class AddTimezoneSettingsToOffers extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017020112562901;
  }

  up() {

    return [
      `ALTER TABLE offers ALTER COLUMN delivery_time TYPE time with time zone USING delivery_time::time with time zone;`,
      `ALTER TABLE offers ALTER COLUMN delivery_date TYPE timestamp with time zone USING delivery_date::timestamp with time zone;`,
      `ALTER TABLE offers ALTER COLUMN created_at TYPE timestamp with time zone USING created_at::timestamp with time zone;`
    ];

  }

  down() {

    return [
      `ALTER TABLE offers ALTER COLUMN delivery_time TYPE time without time zone USING delivery_time::time without time zone;`,
      `ALTER TABLE offers ALTER COLUMN delivery_date TYPE timestamp without time zone USING delivery_date::timestamp without time zone;`,
      `ALTER TABLE offers ALTER COLUMN created_at TYPE timestamp without time zone USING created_at::timestamp without time zone;`
    ];

  }

}

module.exports = AddTimezoneSettingsToOffers;
