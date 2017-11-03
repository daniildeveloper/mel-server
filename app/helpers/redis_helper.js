'use strict'

const Redis = require('ioredis');

class RedisHelper extends Redis {

  static get host() {
    return process.env.REDIS_HOST || '127.0.0.1'
  }

  static get port() {
    return process.env.REDIS_PORT || 6379;
  }

  constructor() {
    super(RedisHelper.port, RedisHelper.host)
  }

}

module.exports = RedisHelper;
