'use strict'

const Apn = require('apn');
const Nodal = require('nodal');
const Gcm = require('node-gcm');
const WebPush = require('web-push')
const PushHelper = Nodal.require('app/helpers/push_helper.js');
const RedisHelper = Nodal.require('app/helpers/redis_helper.js');

class PushService {

  constructor({ webSettings, gcmSettings, apnSettings }) {
    this.apnService = new Apn.Provider(apnSettings)
    this.gcmService = new Gcm.Sender(gcmSettings.serverKey);

    WebPush.setVapidDetails(
      webSettings.email,
      webSettings.publicKey,
      webSettings.privateKey
    );

    this.redis = new RedisHelper();
    this.redis.on('message', this.onMessage.bind(this));

    this.redis.subscribe.apply(this.redis, PushHelper.methodsKeys)
  }

  sendViaApn (push) {
    const note = new Apn.Notification({
      expiry: Math.floor(Date.now() / 1000) + 3600,
      topic: 'Rentateam.melamenu',
      sound: 'ping.aiff',
      alert: push.text,
      badge: 0,
      payload: {
        type: push.type,
        data: push.data
      }
    });

    this.apnService.send(note, push.token)
    .then((response) => {
      if (response.failed) {
        console.log(response.failed);
      }
    })
  }

  sendViaGcm (push) {
    const message = new Gcm.Message();

    message.addNotification({
      title: 'Melamenu',
      body: push.text,
      icon: 'ic_launcher'
    });

    this.gcmService.send(message, { registrationTokens: [ push.token ] }, (err, response) => {
    	if (err) {
        return console.error(err);
      }

      console.log(response);
    });
  }

  sendMobilePush (push) {
    if (!push.token) {
      return
    }

    if (push.token.length === 64) {
      return this.sendViaApn(push)
    }
    else if (push.token.length === 152) {
      return this.sendViaGcm(push)
    }
  }

  sendWebPush (data) {
    if (data instanceof Array) {
      data.forEach((el) => this.sendWebPush(el))
    }
    else {
      WebPush.sendNotification(data.subscription, data.text)
      .catch((err) => {
        console.log(err)
      })
    }
  }

  sendMessage (type, data) {
    if (type === 'MOBILE') {
      return this.sendMobilePush(data)
    }
    else if (type === 'WEB') {
      return this.sendWebPush(data)
    }
  }

  onMessage(event, message) {
    let json = null;

    try {
      json = JSON.parse(message);
    }
    catch (e) {
      return;
    }

    PushHelper.parseMessage(event, json, this.sendMessage.bind(this))
  }

}

module.exports = PushService;
