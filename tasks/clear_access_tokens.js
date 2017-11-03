'use strict';

const Nodal = require('nodal');
const Adapter = Nodal.require('db/main.js');

class ClearAccessTokensTask {

  exec(args, callback) {
    console.log('ClearAccessToken task executed');
    const query = `TRUNCATE access_tokens`;
    Adapter.query(query, [], (err, res) => {
      if (err) {
        console.error(err)
        return callback();
      }
      callback();
    })
  }

}

module.exports = ClearAccessTokensTask;
