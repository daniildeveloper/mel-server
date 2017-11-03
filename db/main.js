'use strict';

const Nodal = require('nodal');

const isProduction = process.env.NODE_ENV === 'production';

class MelamenuDatabase extends Nodal.Database {

  constructor() {
    super()
  }

  log(sql, params, time) {

    if (!isProduction) {
      Nodal.Database.prototype.log.call(this, sql, params, time)
    }

    return true;

  }

  info(message) {

    if (!isProduction) {
      Nodal.Database.prototype.info.call(this, message)
    }

  }

}

const db = new MelamenuDatabase();

db.connect(Nodal.my.Config.db.main);

module.exports = db;
