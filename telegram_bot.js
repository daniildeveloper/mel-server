'use strict'

const Nodal = require('nodal')
const Telegraf = require('telegraf')
const RedisHelper = Nodal.require('app/helpers/redis_helper.js');
const TelegramHelper = Nodal.require('app/helpers/telegram_helper.js');

class TelegramBot {

  constructor ({ token }) {
    this.client = new Telegraf(token)

    this.client.command('help', TelegramHelper.onHelp)
    this.client.command('start', TelegramHelper.onHelp)
    this.client.command('register', TelegramHelper.onRegister)
    this.client.command('unregister', TelegramHelper.onUnRegister)

    this.client.startPolling()

    this.redis = new RedisHelper();
    this.redis.on('message', this.onMessage.bind(this));

    this.redis.subscribe.apply(this.redis, TelegramHelper.methodsKeys)
  }

  onMessage(event, message) {
    let json = null;

    try {
      json = JSON.parse(message);
    }
    catch (e) {
      return;
    }

    TelegramHelper.parseMessage(event, json, this.sendMessage.bind(this))
  }

  sendMessage (chatId, message) {
    if (chatId && message) {
      if (chatId instanceof Array) {
        return chatId.forEach(id => this.sendMessage(id, message))
      }

      this.client.telegram.sendMessage(chatId, message, {
        parse_mode: 'markdown'
      })
      .then((info) => {})
      .catch((err) => { console.log(err) })
    }
  }

}

module.exports = TelegramBot
