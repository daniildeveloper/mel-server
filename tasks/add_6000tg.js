'use strict';

const Nodal = require('nodal');
const Adapter = Nodal.require('db/main.js');

class Add6000tgTask {

  exec(args, callback) {
    console.log('Add6000tg task executed');
    const query = `UPDATE restaurants SET bill=bill+6000`;
    Adapter.query(query, [], (err, res) => {
      if (err) {
        console.error(err)
        return callback();
      }
      callback();
    })
  }

}

module.exports = Add6000tgTask;
