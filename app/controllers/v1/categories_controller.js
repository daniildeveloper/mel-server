'use strict';

const Nodal = require('nodal');
const Async = require('async');
const Errors = Nodal.require('config/errors.json');
const Category = Nodal.require('app/models/category.js');
const Relationships = Nodal.require('app/relationships.js');
const UploadHelper = Nodal.require('app/helpers/upload_helper.js');
const AuthController = Nodal.require('app/controllers/auth_controller.js');
const Adapter = Category.prototype.db;

class V1CategoriesController extends AuthController {

  index () {

    const options = !this.params.query.root ? {} : {
      parent_id__is_null: true
    }

    Category
    .query()
    .where(options)
    .end((err, res) => {

      if (err) {
        return this.respond(err)
      }

      this.respond(res)

    })

  }

  show () {
    const id = this.params.route.id;

    if (!id || Number.isNaN(parseInt(id))) {
      return this.badRequest();
    }

    Category
    .query()
    .where({ id: id })
    .end((err, res) => {

      if (err) {
        return this.respond(err)
      }

      this.respond(res)

    })
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

          Category.update(body.id, body, (err, model) => {

            this.respond(err || model)

          });

        })
      }
      else {
        Category.update(body.id, body, (err, model) => {

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
        return this.respond(new Error(Errors['CATEGORY_AVATAR_IS_NOT_DEFINED']))
      }

      const options = {
        file: body.avatar,
        filename: body.avatar.filename
      }

      UploadHelper.uploadFile(options, (err, filename) => {

        if (err) {
          return this.respond(err)
        }

        body.avatar = filename

        Category.create(body, (err, res) => {

          this.respond(err || res)

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

      const query = `
        DELETE FROM ${Category.table()} WHERE id = $1 OR parent_id = $2
      `

      Category.find(id, (err, model) => {

        if (err) {
          return this.respond(err)
        }

        Adapter.query(query, [ id, id ], (err, res) => {
          console.log(err);

          this.respond(err || model)

        })

      })

    });
  }

}

module.exports = V1CategoriesController;
