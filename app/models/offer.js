'use strict';

const Nodal = require('nodal');
const Moment = require('moment');
const Errors = Nodal.require('config/errors.json');

const isNotNull = v => v !== undefined && v !== null && v.toString().length > 0;
const moreThanZero = v => !Number.isNaN(parseInt(v)) && parseInt(v) > 0;

class Offer extends Nodal.Model {

  static generatePinCode () {
    const pinCodeArray = []

    for (let i = 0; i < 4; i++) {
      pinCodeArray.push(Math.floor(Math.random() * 10))
    }

    return pinCodeArray.join('')
  }

  static generateDeliveryDate (time) {
    const parts = time.split(':')
    return Moment(new Date()).add({
      hours: parts[0],
      minutes: parts[1]
    })
  }

  static parseAmount (amount) {
    if (!amount) {
      return 0
    }

    const amountString =
      amount
      .toString()
      .replace(/ \-/g, '')
      .replace(/\,/g, '.')

    const amountFloat = parseFloat(amountString)

    return !Number.isNaN(amountFloat) ? amountFloat : 0
  }

  beforeSave(callback) {

    if (this.get('amount')) {
      const amount = Offer.parseAmount(this.get('amount'))
      this.set('amount', amount)
    }

    if (this.get('approved')) {
      if (!this.get('delivery_date')) {
        const time = this.get('delivery_time');
        const date = Offer.generateDeliveryDate(time)
        this.set('delivery_date', date)
      }
    }

    callback()
  }

}

Offer.setDatabase(Nodal.require('db/main.js'));
Offer.setSchema(Nodal.my.Schema.models.Offer);

Offer.validates('order_id', Errors['OFFER_ORDER_ID_COULD_NOT_BE_NULL'], isNotNull);
Offer.validates('pin_code', Errors['OFFER_PIN_CODE_COULD_NOT_BE_NULL'], isNotNull);
Offer.validates('restaurant_id', Errors['OFFER_RESTAURANT_ID_COULD_NOT_BE_NULL'], isNotNull);
Offer.validates('delivery_time', Errors['OFFER_DELIVERY_TIME_COULD_NOT_BE_NULL'], isNotNull);
Offer.validates('amount', Errors['OFFER_AMOUNT_COULD_NOT_BE_NULL'], isNotNull && moreThanZero);

module.exports = Offer;
