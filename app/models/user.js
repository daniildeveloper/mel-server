'use strict';

const Nodal = require('nodal');
const Async = require('async');
const Crypto = require('crypto');
const Bcrypt = require('bcryptjs');
const Hashids = require("hashids");
const Errors = Nodal.require('config/errors.json');

const isNotNull = v => v !== undefined && v !== null;
const isValidEmail = v => v && (v + '').match(/.+@.+\.\w+/i);
const isValidPassword = v => v && v.length >= 5;
const isLessThan32Symbols = v => v && v.toString().length <= 32;

class User extends Nodal.Model {

  static generateRandomToken (cb) {
    Crypto.randomBytes(6, (err, buf) => {

      if (err) {
        return cb(err)
      }

      const hash = Crypto
      .createHash('sha256')
      .update(buf.toString())
      .digest('hex')

      cb(null, hash)
    })
  }

  beforeSave(callback) {

    if (this.hasErrors()) {
      return callback();
    }

    const email = this.get('email');

    if (email) {
      this.__safeSet__('email', email.toLowerCase());
    }

    if (!this.get('is_admin')) {
      this.__safeSet__('is_admin', false);
    }

    const tasks = []

    if (!this.get('telegram_token')) {
      tasks.push((cb) => this.generateTelegramToken(cb))
    }

    if (this.hasChanged('password') && this.get('password')) {
      tasks.push((cb) => this.hashPassword(cb))
    }

    if (tasks.length === 0) {
      return callback()
    }

    Async.parallel(tasks, callback)

  }

  hashPassword (cb) {
    Bcrypt.hash(this.get('password'), 10, (err, hash) => {

      if (err) {
        return cb(new Error(Errors['COULD_NOT_ENCRYPT_PASSWORD']));
      }

      this.set('password', hash);

      cb(null)

    });
  }

  generateTelegramToken (cb) {
    User.generateRandomToken((err, hash) => {

      if (err) {
        return cb(err)
      }

      this.__safeSet__('telegram_token', [
        hash
      ]);

      cb(null)
    })
  }

  generatePassword (callback) {
    Crypto.randomBytes(6, (err, buf) => {

      if (err) {
        return callback(err);
      }

      const encoder = new Hashids(buf.toString(), 8)
      const hash  = encoder.encode(Date.now())

      this.__safeSet__('password', hash);

      callback();

    })
  }

  verifyPassword(unencrypted, callback) {
    Bcrypt.compare(unencrypted, this.get('password'), (err, result) => {

      callback.call(this, err, result);

    });
  }

}

User.setDatabase(Nodal.require('db/main.js'));
User.setSchema(Nodal.my.Schema.models.User);

User.validates('email', Errors['MUST_BE_VALID'], isValidEmail);

User.verifies(Errors['USER_ALREADY_EXIST'], (id, email, callback) => {
  if (id) {
    User.find(id, (err, model) => {
      if (err) {
        return callback(false)
      }

      if (model.get('email') === email) {
        return callback(true)
      }

      User.query().where({ email : email }).limit(1).end((err, res) => {
        if (err) {
          return callback(false)
        }

        if (res.length > 0) {
          return callback(false);
        }

        return callback(true);
      })
    })
  }
  else {
    User.query().where({ email : email }).limit(1).end((err, res) => {
      if (err) {
        return callback(false)
      }

      if (res.length > 0) {
        return callback(false);
      }

      return callback(true);
    })
  }
});


User.hides('password');
User.hides('telegram_chat_settings');

module.exports = User;
