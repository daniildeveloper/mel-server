'use strict';

const Nodal = require('nodal');
const Adapter = Nodal.require('db/main.js');
const User = Nodal.require('app/models/user.js');
const Errors = Nodal.require('config/errors.json');

const isNotNull = v => v !== undefined && v !== null && v !== 'null' && v.toString().length > 0;
const intMoreThanZero = v => parseInt(v) !== Number.isNaN(v) && parseInt(v) > 0;

class Restaurant extends Nodal.Model {

  static getByUserId (userId, cb = function () {}) {
    Restaurant
    .query()
    .where({ admin_id: userId })
    .limit(1)
    .end((err, res) => {

      if (err) {
        return cb(err)
      }

      if (res.length === 0) {
        return cb(new Error(Errors['COULD_NOT_FIND_RESTAURANT_ADMIN']))
      }

      return cb(null, res.pop())

    });
  }

  static getByCategoriesAndCity (categories, order, cb = function () {}) {
    const cityId = order.city_id
    const onlyCard = order.payment_method === 'card'
    const cloudpaymentsCond = onlyCard ? ` AND cloudpayments_id != ''` : ''
    const query = `
      SELECT
        *
      FROM
        restaurants
      WHERE
        city_id = $1 AND
        id IN (
          SELECT
            restaurant_id
          FROM
            restaurant_categories
          WHERE
            category_id
          IN (${categories.join(',')})
            ${cloudpaymentsCond}
          GROUP BY 
            restaurant_id
          HAVING 
            COUNT(DISTINCT category_id) = ${categories.length}
        )
    `

    Adapter.query(query, [ cityId ], (err, res) => {
      if (err) {
        return cb(err)
      }

      cb(null, res.rows)
    })
  }

}

Restaurant.setDatabase(Nodal.require('db/main.js'));
Restaurant.setSchema(Nodal.my.Schema.models.Restaurant);

Restaurant.validates('phone', Errors['RESTAURANT_PHONE_IS_NOT_DEFINED'], isNotNull);
Restaurant.validates('avatar', Errors['RESTAURANT_AVATAR_IS_NOT_DEFINED'], isNotNull);
Restaurant.validates('address', Errors['RESTAURANT_ADDRESS_IS_NOT_DEFINED'], isNotNull);
Restaurant.validates('city_id', Errors['RESTAURANT_CITY_ID_IS_NOT_DEFINED'], isNotNull && intMoreThanZero);
Restaurant.validates('admin_id', Errors['RESTAURANT_ADMIN_ID_IS_NOT_DEFINED'], isNotNull);
Restaurant.validates('description', Errors['RESTAURANT_DESCRIPTION_IS_NOT_DEFINED'], isNotNull);

Restaurant.verifies(Errors['RESTAURANT_ADMIN_ID_IS_BUSY'], (id, admin_id, callback) => {
  const options = {
    admin_id: admin_id
  }

  if (id) {
    Object.assign(options, {
      id__not: id
    })
  }

  Restaurant
  .query()
  .where(options)
  .end((err, res) => {
    if (err) {
      return callback(false)
    }

    if (res.length > 0) {
      return callback(false)
    }

    return callback(true)
  })
});

module.exports = Restaurant;
