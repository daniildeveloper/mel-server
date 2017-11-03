'use strict';

const Nodal = require('nodal');
const Errors = Nodal.require('config/errors.json');

const isNotNull = v => v !== undefined && v !== null && v.toString().length > 0;

class Category extends Nodal.Model {

  beforeSave(callback) {

    if (!this.get('parent_id')) {
      this.set('parent_id', null)
    }

    callback()
  }

}

Category.setDatabase(Nodal.require('db/main.js'));
Category.setSchema(Nodal.my.Schema.models.Category);

Category.validates('name', Errors['CATEGORY_NAME_IS_NOT_DEFINED'], isNotNull);

Category.verifies(Errors['CATEGORY_AVATAR_IS_NOT_DEFINED'], (avatar, parent_id, callback) => {
  if (parent_id) {
    return callback(true)
  }

  return callback(isNotNull(avatar))
});

module.exports = Category;
