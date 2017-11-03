'use strict';

const Nodal = require('nodal');
const Crypto = require('crypto');
const User = Nodal.require('app/models/user.js');
const Errors = Nodal.require('config/errors.json');

class AccessToken extends Nodal.Model {

  static generateAccessTokenString() {
    return Crypto
      .createHmac('md5', Crypto.randomBytes(512).toString())
      .update([].slice.call(arguments).join(':'))
      .digest('hex');
  }

  static login(user, password, callback) {

    user.verifyPassword(password, (err, result) => {

      if (err || !result) {
        return callback(new Error(Errors['INVALID_CREDENTIALS']));
      }

      const options = {
        token_type: 'bearer',
        user_id: user.get('id'),
        expires_at: (new Date(new Date().valueOf() + (30 * 24 * 60 * 60 * 1000))),
        access_token: this.generateAccessTokenString(user.get('id'), user.get('email'), new Date().valueOf())
      }

      new AccessToken(options).save(callback);

    });

  }

  static verify(params, callback) {

    AccessToken.query()
      .join('user')
      .where({
        access_token: params.auth.access_token,
        expires_at__gte: new Date()
      })
      .end((err, accessTokens) => {

        if (err || !accessTokens || !accessTokens.length) {
          return callback(new Error(Errors['INVALID_TOKEN']));
        }

        const accessToken = accessTokens[0];
        const user = accessToken.joined('user')

        if (!user) {
          return callback(new Error(Errors['INVALID_TOKEN']));
        }

        return callback(null, accessToken, user);

      });

  }

  static logout(params, callback) {

    this.verify(params, (err, accessToken) => {

      if (err) {
        return callback(err);
      }

      return accessToken.destroy(callback);

    });

  }

}

AccessToken.setDatabase(Nodal.require('db/main.js'));
AccessToken.setSchema(Nodal.my.Schema.models.AccessToken);

AccessToken.joinsTo(User, {multiple: true});

module.exports = AccessToken;
