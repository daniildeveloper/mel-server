'use strict';

const Nodal = require('nodal');
const Async = require('async');
const Errors = Nodal.require('config/errors.json');
const Relationships = Nodal.require('app/relationships.js');
const Restaurant = Nodal.require('app/models/restaurant.js');
const AuthController = Nodal.require('app/controllers/auth_controller.js');
const RestaurantsHelper = Nodal.require('app/helpers/restaurants_helper.js');
const RestaurantCategory = Nodal.require('app/models/restaurant_category.js');
const Axios = require('axios');
const Moment = require('moment');

const returnedColumns = Restaurant.columns().reduceRight((memo, c) => {
  if (!Restaurant.isHidden(c.name)) {
    memo.unshift(c.name)
  }
  return memo;
}, ['admin', 'restaurant_categories']);

class V1RestaurantsController extends AuthController {

  index () {

    Restaurant
      .query()
      .join('admin')
      .join('restaurant_categories')
      .orderBy('id', 'desc')
      .where(this.params.query)
      .end((err, models) => {

        if (err) {
          return this.respond(err)
        }

        this.respond(models, returnedColumns);

      });

  }

  show () {

    Restaurant
      .query()
      .join('admin')
      .join('restaurant_categories')
      .where({ id: this.params.route.id })
      .end((err, models) => {

        if (err) {
          return this.respond(err)
        }

        this.respond(models, returnedColumns);

      });

  }

  create () {

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err);
      }

      if (user.get('is_admin') !== true) {
        return this.unauthorized();
      }

      const tasks = []
      const body = this.params.body

      const restaurant = new Restaurant(body);

      tasks.push((cb) => {
        restaurant.__verify__(cb)
      })

      tasks.push((cb) => {
        RestaurantsHelper.uploadAvatar(body.avatar, (err, filename) => {
          if (err) {
            return cb(err)
          }

          restaurant.set('avatar', filename)

          cb(null)
        })
      })

      tasks.push((cb) => {
        restaurant.save((err) => {
          if (err) {
            return cb(err);
          }

          cb(null)
        })
      })

      tasks.push((cb) => {
        RestaurantsHelper.saveCategories(body.categories, restaurant.get('id'), (err) => {
          cb(err || null)
        })
      })

      tasks.push((cb) => {
        Restaurant
          .query()
          .join('admin')
          .join('restaurant_categories')
          .where({ id: restaurant.get('id') })
          .end(cb);
      })

      Async.waterfall(tasks, (err, model) => {

        if (err) {
          return this.respond(err)
        }

        this.respond(model, returnedColumns);

      })

    })

  }

  update () {

    const id = this.params.route.id;

    if (!id || Number.isNaN(parseInt(id))) {
      return this.badRequest();
    }

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err);
      }

      if (user.get('is_admin') !== true) {
        return this.unauthorized();
      }

      const tasks = [];
      const body = this.params.body

      this.initCloudpaymentValidation(body, tasks)

      if (body.avatar) {
        tasks.push((cb) => {
          RestaurantsHelper.uploadAvatar(body.avatar, (err, filename) => {
            if (err) {
              return cb(err)
            }

            body.avatar = filename

            cb(null)
          })
        })
      }

      tasks.push((cb) => {
        RestaurantsHelper.saveCategories(body.categories, this.params.route.id, (err) => {
          cb(err || null)
        })
      })

      tasks.push((cb) => {
        Restaurant.update(this.params.route.id, body, (err) => {
          cb(err || null)
        });
      })

      tasks.push((cb) => {
        Restaurant
          .query()
          .join('admin')
          .join('restaurant_categories')
          .where({ id: this.params.route.id })
          .end(cb);
      })

      Async.waterfall(tasks, (err, model) => {

        if (err) {
          return this.respond(err)
        }

        this.respond(model, returnedColumns);

      })

    });

  }

  initCloudpaymentValidation (body, tasks) {
    if (body.cloudpayments_id) {
      if (!body.cloudpayments_password) {
        return this.error('Cloudpayments API password is empty')
      }
      tasks.push((cb) => {
        // Test credentials
        Axios({
          method: 'post',
          auth: {
            username: body.cloudpayments_id,
            password: body.cloudpayments_password
          },
          url: 'https://api.cloudpayments.kz/payments/list',
          data: {
            Date: Moment().format('YYYY-MM-DD')
          }
        }).then(() => {
          cb(null)
        }).catch((err) => {
          if (!err.response) {
            return cb(new Error('Network error. Try again later'))
          }
          if (err.response.status === 401) {
            return cb(new Error('Неверные данные Cloudpayments'))
          } else {
            return cb(new Error(err.response.statusText))
          }
        })
      })
    }
  }

  destroy () {

    const id = this.params.route.id;

    if (!id || Number.isNaN(parseInt(id))) {
      return this.badRequest();
    }

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err);
      }

      if (user.get('is_admin') !== true) {
        return this.unauthorized();
      }

      Restaurant.destroy(this.params.route.id, (err, model) => {

        this.respond(err || model);

      });

    });

  }

}

module.exports = V1RestaurantsController;
