'use strict';

const Nodal = require('nodal');
const Errors = Nodal.require('config/errors.json');

const isNotNull = v => v !== undefined && v !== null && v.toString().length > 0;

class Dish extends Nodal.Model {}

Dish.setDatabase(Nodal.require('db/main.js'));
Dish.setSchema(Nodal.my.Schema.models.Dish);

Dish.validates('name', Errors['DISH_NAME_IS_NOT_DEFINED'], isNotNull);
Dish.validates('avatar', Errors['DISH_AVATAR_IS_NOT_DEFINED'], isNotNull);
Dish.validates('description', Errors['DISH_DESCRIPTION_IS_NOT_DEFINED'], isNotNull);

module.exports = Dish;
