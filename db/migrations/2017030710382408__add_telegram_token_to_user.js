'use strict';

const Nodal = require('nodal');

class AddTelegramTokenToUser extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017030710382408;
  }

  up() {

    return [
      this.addColumn('users', 'telegram_token', 'string'),
      this.addColumn('users', 'telegram_chat_settings', 'json')
    ];

  }

  down() {

    return [
      this.dropColumn('users', 'telegram_token'),
      this.dropColumn('users', 'telegram_chat_settings')
    ];

  }

}

module.exports = AddTelegramTokenToUser;
