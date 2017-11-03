'use strict';

const Nodal = require('nodal');

class AddIndexes extends Nodal.Migration {

  constructor(db) {
    super(db);
    this.id = 2017071809514293;
  }

  up() {

    return [
      this.createIndex('access_tokens', 'user_id'),
      this.createIndex('access_tokens', 'expires_at'),
      this.createIndex('access_tokens', 'access_token'),

      this.createIndex('categories', 'name'),
      this.createIndex('categories', 'parent_id'),

      this.createIndex('cities', 'name'),

      this.createIndex('dishes', 'name'),
      this.createIndex('dishes', 'price'),
      this.createIndex('dishes', 'category_id'),

      this.createIndex('offers', 'amount'),
      this.createIndex('offers', 'order_id'),
      this.createIndex('offers', 'restaurant_id'),
      this.createIndex('offers', 'delivery_time'),
      this.createIndex('offers', 'delivery_date'),
      this.createIndex('offers', 'pin_code'),
      this.createIndex('offers', 'approved'),
      this.createIndex('offers', 'canceled'),

      this.createIndex('orders', 'hash'),
      this.createIndex('orders', 'date'),
      this.createIndex('orders', 'active'),
      this.createIndex('orders', 'expired'),
      this.createIndex('orders', 'city_id'),
      this.createIndex('orders', 'delivered'),
      this.createIndex('orders', 'push_token'),
      this.createIndex('orders', 'categories'),
      this.createIndex('orders', 'last_push_date'),

      this.createIndex('restaurant_categories', 'category_id'),
      this.createIndex('restaurant_categories', 'restaurant_id'),

      this.createIndex('restaurants', 'city_id'),
      this.createIndex('restaurants', 'admin_id'),
      this.createIndex('restaurants', 'push_token'),

      this.createIndex('users', 'email'),
      this.createIndex('users', 'password'),
      this.createIndex('users', 'is_admin'),
      this.createIndex('users', 'telegram_token'),
      this.createIndex('users', 'telegram_chat_settings')
    ];

  }

  down() {

    return [
      this.dropIndex('access_tokens', 'user_id'),
      this.dropIndex('access_tokens', 'expires_at'),
      this.dropIndex('access_tokens', 'access_token'),

      this.dropIndex('categories', 'name'),
      this.dropIndex('categories', 'parent_id'),

      this.dropIndex('cities', 'name'),

      this.dropIndex('dishes', 'name'),
      this.dropIndex('dishes', 'price'),
      this.dropIndex('dishes', 'category_id'),

      this.dropIndex('offers', 'amount'),
      this.dropIndex('offers', 'order_id'),
      this.dropIndex('offers', 'restaurant_id'),
      this.dropIndex('offers', 'delivery_time'),
      this.dropIndex('offers', 'delivery_date'),
      this.dropIndex('offers', 'pin_code'),
      this.dropIndex('offers', 'approved'),
      this.dropIndex('offers', 'canceled'),

      this.dropIndex('orders', 'hash'),
      this.dropIndex('orders', 'date'),
      this.dropIndex('orders', 'active'),
      this.dropIndex('orders', 'expired'),
      this.dropIndex('orders', 'city_id'),
      this.dropIndex('orders', 'delivered'),
      this.dropIndex('orders', 'push_token'),
      this.dropIndex('orders', 'categories'),
      this.dropIndex('orders', 'last_push_date'),

      this.dropIndex('restaurant_categories', 'category_id'),
      this.dropIndex('restaurant_categories', 'restaurant_id'),

      this.dropIndex('restaurants', 'city_id'),
      this.dropIndex('restaurants', 'admin_id'),
      this.dropIndex('restaurants', 'push_token'),

      this.dropIndex('users', 'email'),
      this.dropIndex('users', 'password'),
      this.dropIndex('users', 'is_admin'),
      this.dropIndex('users', 'telegram_token'),
      this.dropIndex('users', 'telegram_chat_settings')
    ];

  }

}

module.exports = AddIndexes;
