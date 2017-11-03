'use strict';

const Nodal = require('nodal');

class MakeTelegramTokenMultiple extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017081111430688;
  }

  up() {

    return [
      `SELECT * INTO TABLE temp_users FROM users`,

      this.dropColumn('users', 'telegram_token'),

      this.addColumn('users', 'telegram_token', 'string', {
        array: true
      }),

      `
        WITH t AS (
          SELECT * FROM temp_users
        )
        UPDATE
          users
        SET
          telegram_token = ARRAY[t.telegram_token]
        FROM t
        WHERE
          users.id = t.id
      `,

      `DROP TABLE temp_users`
    ];

  }

  down() {

    return [
      `SELECT * INTO TABLE temp_users FROM users`,

      this.dropColumn('users', 'telegram_token'),

      this.addColumn('users', 'telegram_token', 'string'),

      `
        WITH t AS (
          SELECT * FROM temp_users
        )
        UPDATE users SET telegram_token = t.telegram_token[0] FROM t
      `,

      `DROP TABLE temp_users`
    ];

  }

}

module.exports = MakeTelegramTokenMultiple;
