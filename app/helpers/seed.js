module.exports = (function() {

  'use strict';

  const Nodal = require('nodal');
  const Seed = Nodal.require('config/seed.json');

  const Models = require('fs').readdirSync('./app/models').reduce((memo, item) => {
    let Model = Nodal.require('app/models/' + item);
    memo[Model.name] = Model;
    return memo;
  }, {});

  const db = new Nodal.Database();

  db.connect(Nodal.my.Config.db.main);

  const data = Seed['development'];

  const keys = Object.keys(data);

  const seedNext = (callback) => {
    const currentKey = keys.shift();

    if (!currentKey) {
      return process.nextTick(process.exit);
    }

    const model = Models[currentKey];
    const values = data[currentKey];
    const table = model.table();

    if (!model) {
      throw new Error('Ouch, there is no model for key ' + currentKey);
    }

    const saveNextValue = function () {
      let value = values.shift();

      if (!value) {
        return process.nextTick(seedNext);
      }

      model.create(value, (err) => {
        if (err) {
          if (err.details) {
            console.error(err.details);
          }
          throw new Error(err);
        }

        process.nextTick(saveNextValue);
      });
    }

    saveNextValue();
  }

  seedNext();

  return db;

})();
