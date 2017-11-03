'use strict';

const Nodal = require('nodal');
const Adapter = Nodal.require('db/main.js');
const AccessToken = Nodal.require('app/models/access_token.js');

class RemoveOldTokens {

  exec(a,b, callback) {

    const query = `
      delete from ${AccessToken.table()} where expires_at <= now()
    `

    Adapter.query(query, [], (err, res) => {
      if (err) {
        console.error(err)
      }
      callback();
    })

  }

}

module.exports = RemoveOldTokens;
