'use strict';

const Nodal = require('nodal');
const User = Nodal.require('app/models/user.js');
const Dish = Nodal.require('app/models/dish.js');
const Offer = Nodal.require('app/models/offer.js');
const Order = Nodal.require('app/models/order.js');
const Category = Nodal.require('app/models/category.js');
const Restaurant = Nodal.require('app/models/restaurant.js');
const RestaurantCategory = Nodal.require('app/models/restaurant_category.js');

Dish.joinsTo(Category, { multiple: true });

Restaurant.joinsTo(User, {
  via: 'admin_id',
  as: 'admin'
})

Offer.joinsTo(Restaurant)

Offer.joinsTo(Order, {
  multiple: true
})

RestaurantCategory.joinsTo(Restaurant, {
  multiple: true,
  as: 'restaurant_categories'
})

module.exports = {}; // Don't need to export anything
