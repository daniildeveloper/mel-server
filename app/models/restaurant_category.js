'use strict';

const Nodal = require('nodal');
const Errors = Nodal.require('config/errors.json');

const isNotNull = v => v !== undefined && v !== null && v.toString().length > 0;

class RestaurantCategory extends Nodal.Model {}

RestaurantCategory.setDatabase(Nodal.require('db/main.js'));
RestaurantCategory.setSchema(Nodal.my.Schema.models.RestaurantCategory);

RestaurantCategory.validates('category_id', Errors['COULD_NOT_BE_NULL'], isNotNull);
RestaurantCategory.validates('restaurant_id', Errors['COULD_NOT_BE_NULL'], isNotNull);

module.exports = RestaurantCategory;
