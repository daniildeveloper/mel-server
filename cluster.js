'use strict';

require('newrelic');

const Nodal = require('nodal');
const Cluster = require('cluster');

const isProduction = process.env.NODE_ENV === 'production'
const botDisabled = process.env.TELEGRAM_BOT === 'disabled'

const webSettings = {
  publicKey: 'BDcjNcTt2TgUbIxRl01evXs1WWtpxxxXRCYlc6QZdbIBj2sHpmG6AvwTrDkninBfLFJRFNF_huHrfwRGWay1LZ4',
  privateKey: 'j7nQGXPG9-q3oOjIzPTfI1JvqawlxShpgdrXKdXukDU',
  email: 'mailto:info@melamenu.com'
}

const gcmSettings = {
  serverKey: 'AIzaSyBT3BBDSxWa_VZF5ATL3fLw3wgdYs7Cyts',
  senderId: 827309549145
}

const apnSettings = {
  production: true,
  connectionTimeout: 60000,
  cert: `./certs/production_cert.pem`,
  key: `./certs/production_key.pem`
}

const telegramBotKey = (function () {
  const devKey = '427947267:AAG5RqbCjgclPBCb5xeJCeiVgq_0Z_MPHHw'
  const prodKey = '314037417:AAE4M2AWUVZobZi8aDIsMw2MBbmzFhouVfo'
  return isProduction ? prodKey : devKey
})()

if (Cluster.isMaster) {

  const daemon = new Nodal.Daemon();

  const PushServer = require('./push_server.js');
  const TelegramBot = require('./telegram_bot.js')

  new PushServer({
    webSettings,
    gcmSettings,
    apnSettings
  });

  if (!botDisabled) {
    new TelegramBot({
      token: telegramBotKey
    })
  }

  daemon.start(Nodal.my.Config.secrets.port);

} else {

  const app = new Nodal.Application();
  app.listen(Nodal.my.Config.secrets.port);

}
