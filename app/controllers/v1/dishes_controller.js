'use strict';

const Nodal = require('nodal');
const Dish = Nodal.require('app/models/dish.js');
const Errors = Nodal.require('config/errors.json');
const Category = Nodal.require('app/models/category.js');
const Relationships = Nodal.require('app/relationships.js');
const UploadHelper = Nodal.require('app/helpers/upload_helper.js');
const AuthController = Nodal.require('app/controllers/auth_controller.js');

const returnedColumns = Category.columns().reduceRight((memo, c) => {
  memo.unshift(c.name)
  return memo;
}, [ 'dishes' ]);

class V1DishesController extends AuthController {

  get() {

    if (this.params.query.onlyDishes) {
      return Dish
      .query()
      .where(this.params.query)
      .end((err, models) => {

        if (err) {
          return this.respond(err)
        }

        this.respond(models);

      });
    }

    Category
    .query()
    .join('dishes')
    .where(this.params.query)
    .orderBy('id', 'desc')
    .end((err, models) => {

      if (err) {
        return this.respond(err)
      }

      this.respond(models, returnedColumns);

    });

  }

  put () {
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

      const tasks = []
      const body = this.params.body;

      if (body.avatar) {
        const options = {
          file: body.avatar,
          filename: body.avatar.filename
        }

        UploadHelper.uploadFile(options, (err, filename) => {
          if (err) {
            return this.respond(err);
          }

          body.avatar = filename

          if (body.category_id === 'null') {
            delete body.category_id
          }

          Dish.update(body.id, body, (err, model) => {
            this.respond(err || model)
          });
        })
      }
      else {
        Dish.update(body.id, body, (err, model) => {
          this.respond(err || model)
        });
      }

    });
  }

  post () {

    this.authorize((err, token, user) => {

      if (err) {
        return this.respond(err);
      }

      if (user.get('is_admin') !== true) {
        return this.unauthorized();
      }

      const body = this.params.body;

      if (!Buffer.isBuffer(body.avatar)) {
        return this.respond(new Error(Errors['DISH_AVATAR_IS_NOT_DEFINED']))
      }

      const options = {
        file: body.avatar,
        filename: body.avatar.filename
      }

      UploadHelper.uploadFile(options, (err, filename) => {

        if (err) {
          return this.respond(err);
        }

        body.avatar = filename

        if (body.category_id === 'null') {
          delete body.category_id
        }

        Dish.create(body, (err, model) => {

          this.respond(err || model)

        });
      })

    });
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

      Dish.destroy(id, (err, model) => {

        this.respond(err || model)

      })

    });
  }

}

module.exports = V1DishesController;
