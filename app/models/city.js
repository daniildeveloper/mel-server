'use strict';

const Nodal = require('nodal');
const Errors = Nodal.require('config/errors.json');

const isNotNull = v => v !== undefined && v !== null && v.toString().length > 0;

class City extends Nodal.Model {}

City.setDatabase(Nodal.require('db/main.js'));
City.setSchema(Nodal.my.Schema.models.City);

City.validates('name', Errors['COULD_NOT_BE_NULL'], isNotNull);

module.exports = City;
