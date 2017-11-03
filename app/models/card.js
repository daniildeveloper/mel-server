'use strict';

const Nodal = require('nodal');
const uuid = require('uuid');

class Card extends Nodal.Model {

  beforeSave(callback) {
    if (!this.get('hash')) {
      this.set('hash', uuid.v4())
    }
    callback()
  }

}

Card.setDatabase(Nodal.require('db/main.js'));
Card.setSchema(Nodal.my.Schema.models.Card);

module.exports = Card;
