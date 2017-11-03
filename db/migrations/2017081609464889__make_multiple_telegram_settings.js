'use strict';

const Nodal = require('nodal');

class MakeMultipleTelegramSettings extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017081609464889;
  }

  up() {

    return [
      `
        UPDATE
          users
        SET telegram_chat_settings = (
          telegram_chat_settings || '["newString"]'::jsonb - 'newString'
        )
        WHERE
          telegram_chat_settings is not null
      `
    ];

  }

  down() {

    return [

    ];

  }

}

module.exports = MakeMultipleTelegramSettings;
