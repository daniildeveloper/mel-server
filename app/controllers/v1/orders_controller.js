'use strict';

import rating from 'rating';

const Rating = require('rating');
const Nodal = require('nodal');
const Order = Nodal.require('app/models/order.js');
const Offer = Nodal.require('app/models/offer.js');
const Errors = Nodal.require('config/errors.json');
const Constants = Nodal.require('config/constants.js')
const RedisHelper = Nodal.require('app/helpers/redis_helper.js');
const RestaurantsHelper = Nodal.require('app/helpers/restaurants_helper.js');

const PubRedis = new RedisHelper()

const offersColumns = Offer.columns().reduceRight((memo, c) => {
  memo.unshift(c.name)
  return memo
}, [ 'restaurant' ]);

const returnedColumns = Order.columns().reduceRight((memo, c) => {
  memo.unshift(c.name)
  return memo;
}, [ { 'offers': offersColumns } ]);

class OrderController extends Nodal.Controller {

  get () {
    const hash = this.params.route.id;

    if (!hash) {
      return this.badRequest();
    }

    const options = {
      hash: hash
    }

    Order
    .query()
    .where(options)
    .join('offers')
    .join('offers__restaurant')
    .end((err, res) => {

      if (err) {
        return this.respond(err)
      }

      if (res.length === 0) {
        return this.respond(new Error(Errors['COULD_NOT_FIND_ORDER']))
      }

      const model = res.pop()

      if (model.get('expired')) {
        return this.respond(model, ['id', 'hash', 'expired', 'active'])
      }

      const json = model.toObject(returnedColumns)

      if (json.offers && json.offers instanceof Array) {
        Object.assign(json, {
          offers: json.offers.filter(o => o.canceled !== true)
        })
      }

      this.respond(json)

    });
  }

  post() {

    const body = this.params.body

    if (!body.client_order || body.client_order instanceof Array !== true) {
      return this.badRequest()
    }

    let payment_method
    if (!body.payment_method) {
      payment_method = 'cash'
    } else if (body.payment_method !== 'cash' && body.payment_method !== 'card') {
      payment_method = 'cash'
    } else {
      payment_method = body.payment_method
    }

    const options = Order.defaults({
      active: true,
      expired: false,
      delivered: false,
      comment: body.comment,
      rating: body.rating
      city_id: body.city_id,
      push_token: body.push_token,
      client_order: body.client_order,
      client_address: body.client_address,
      payment_method: payment_method
    })

    Order.create(options, (err, model) => {

      if (err) {
        return this.respond(err)
      }

      PubRedis.publish(Constants.RESTAURANT_PUSH_NEW_ORDER, JSON.stringify({
        order: model.toObject()
      }));

      PubRedis.publish(Constants.TELEGRAM_NOTIFY_NEW_ORDER, JSON.stringify({
        order: model.toObject()
      }));

      this.respond(model)

    })

  }

  put () {
    const hash = this.params.route.id;

    if (!hash) {
      return this.badRequest()
    }

    Order.findBy('hash', hash, (err, model) => {

      if (err) {
        return this.respond(err)
      }

      model.set('client_name', this.params.body.client_name)
      model.set('client_phone', this.params.body.client_phone)

      if (this.params.body.payment_method !== 'cash' && this.params.body.payment_method !== 'card') {
        model.set('payment_method', 'cash')
      } else {
        model.set('payment_method', this.params.body.payment_method)
      }

      if (this.params.body.card_hash) {
        model.set('card_hash', this.params.body.card_hash)
      }

      model.save((err, model) => {

        this.respond(err || model);

      })

    })
  }

  destroy () {
    const hash = this.params.route.id;

    if (!hash) {
      return this.badRequest();
    }

    Order.findBy('hash', hash, (err, model) => {

      if (err) {
        this.respond(err)
      }

      if (!model) {
        return this.badRequest()
      }

      const deleteOrder = () => {
        model.destroy((err) => {
          this.respond(err || model)
        })
      }

      if (model.get('payment_method') === 'card' && model.get('transaction_id')) {
        RestaurantsHelper.cancelPayment(model.get('transaction_id'), (err) => {

          if (err) {
            return this.respond(err || model)
          }

          deleteOrder()

        })
      } else {

        deleteOrder()

      }

    })
  }

}

module.exports = OrderController;
