'use strict';

const Nodal = require('nodal');
const Restaurant = Nodal.require('app/models/restaurant.js');
const Constants = Nodal.require('config/constants.js')
const RedisHelper = Nodal.require('app/helpers/redis_helper.js')

const PubRedis = new RedisHelper()

class V1PaymentController extends Nodal.Controller {

  post () {

    const actions = {
      pay: () => {

        Restaurant.find(data.restaurantId, (err, restaurant) => {
          if (err) {
            return this.respond(err)
          }
          const options = {
            bill: restaurant.get('bill') + parseFloat(this.params.body.PaymentAmount)
          }
          Restaurant.update(restaurant.get('id'), options, (err, restaurant) => {
            if (err) {
              return this.respond(err)
            }
            const data = restaurant.toObject()
            data.payment_amount = this.params.body.PaymentAmount
            PubRedis.publish(Constants.TELEGRAM_NOTIFY_BALANCE_CHANGED, JSON.stringify({
              restaurant: data
            }))
            this.render('{"code":0}')
          })
        })
      },
      fail: () => {
        this.render('{"code":0}')
      }
    };

    if (!this.params.route.secret || this.params.route.secret !== process.env.PAYMENT_SECRET) {
      return this.notFound();
    }
    if (!this.params.route.action || !actions[this.params.route.action]) {
      return this.notFound('Action not defined');
    }
    if (!this.params.body.Data) {
      return this.notFound('Data is empty');
    }
    let data;
    try {
      data = JSON.parse(this.params.body.Data);
    } catch (err) {
      return this.notFound('JSON parse error');
    }
    if (!data.restaurantId) {
      return this.notFound('No restaurantId in Data');
    }
    if (!this.params.body.PaymentAmount) {
      return this.notFound('No PaymentAmount');
    }

    // action
    actions[this.params.route.action]();
  }

}

module.exports = V1PaymentController;
