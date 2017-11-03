'use strict'

const Fs = require('fs');
const Path = require('path');
const Nodal = require('nodal');
const Axios = require('axios');
const Officegen = require('officegen');
const Moment = require('moment-timezone');

const Adapter = Nodal.require('db/main.js');
const Errors = Nodal.require('config/errors.json');
const Offer = Nodal.require('app/models/offer.js');
const Order = Nodal.require('app/models/order.js');
const Card = Nodal.require('app/models/card.js');
const Restaurant = Nodal.require('app/models/restaurant.js');
const UploadHelper = Nodal.require('app/helpers/upload_helper.js');
const RestaurantCategory = Nodal.require('app/models/restaurant_category.js');

const offerColumns = Offer.columns().reduceRight((memo, c) => {
  if (!Order.isHidden(c.name)) {
    memo.unshift(c.name)
  }
  return memo;
}, ['order']);

class RestaurantsHelper {

  static getCategoriesByAdmin (userId, cb) {

    const query = `
      SELECT * FROM ${RestaurantCategory.table()} WHERE restaurant_id = (
        SELECT id FROM ${Restaurant.table()} WHERE admin_id = $1 LIMIT 1
      )
    `

    Adapter.query(query, [userId], (err, res) => {
      if (err) {
        return cb(err)
      }

      cb(null, res.rows.map(c => c.category_id))
    })

  }

  static maxDiscount () {
    return 0.4
  }

  static getDiscount (offer) {
    const currentDate = new Date()
    const promisedDate = offer.get('delivery_date')

    const format = 'DD/MM/YYYY HH:mm:ss'

    const currentMoment = Moment(currentDate, format)
    const promisedMoment = Moment(promisedDate, format)

    const ms = promisedMoment.diff(currentMoment)
    const minutes = Math.round(ms / 1000 / 60) * -1

    let discount = 0;

    if (minutes > 10 && minutes <= 20) {
      discount = 0.05;
    }
    else if (minutes > 20 && minutes <= 30) {
      discount = 0.1
    }
    else if (minutes > 30 && minutes <= 40) {
      discount = 0.15
    }
    else if (minutes > 40 && minutes <= 50) {
      discount = 0.2
    }
    else if (minutes > 50 && minutes <= 60) {
      discount = 0.25
    }
    else if (minutes > 60 && minutes <= 70) {
      discount = 0.30
    }
    else if (minutes > 70 && minutes <= 80) {
      discount = 0.35
    }
    else if (minutes > 80) {
      discount = this.maxDiscount()
    }

    return discount
  }

  static saveCategories (categories, restaurantId, cb) {
    if (!categories) {
      return cb(null)
    }

    try {
      const task = []
      const json = JSON.parse(categories)

      const modelArray = json.map((category) => {
        return new RestaurantCategory({
          restaurant_id: restaurantId,
          category_id: category
        })
      });

      const query = `
        DELETE FROM ${RestaurantCategory.table()}
        WHERE restaurant_id = $1
      `
      Adapter.query(query, [restaurantId], (err) => {

        if (err) {
          return cb(err)
        }

        if (!modelArray.length) {
          return cb(null)
        }

        Nodal.ModelArray.from(modelArray).saveAll(cb)

      })
    }
    catch (e) {
      return cb(e)
    }
  }

  static uploadAvatar (file, cb) {
    if (!file) {
      return cb(null)
    }

    if (!Buffer.isBuffer(file)) {
      return cb(new Error(Errors['RESTAURANT_AVATAR_IS_NOT_DEFINED']))
    }

    const options = {
      file: file,
      filename: file.filename
    }

    UploadHelper.uploadFile(options, (err, filename) => {
      if (err) {
        return cb(err);
      }

      cb(null, filename)
    })
  }

  static generateReport (id, callback) {

    const options = {
      approved: true,
      restaurant_id: id,
      order__active: false,
      order__expired: false,
      order__delivered: true
    }

    Offer
      .query()
      .where(options)
      .join('order')
      .end((err, res) => {

        if (err) {
          return callback(err)
        }

        const data = res.toObject(offerColumns).map((v) => {
          return [
            v.order_id,
            v.order.client_name,
            v.order.client_phone,
            v.order.client_address,
            Moment(v.order.created_at).format('HH:mm DD.MM.YYYY'),
            v.total
          ]
        })

        data.unshift([
          '#',
          'Имя клиента',
          'Телефон',
          'Адрес',
          'Дата и время заказа',
          'Сумма чека'
        ])

        const xlsx = Officegen('xlsx');
        const filename = `report_${Date.now()}.xlsx`

        const sheet = xlsx.makeNewSheet();
        sheet.name = `Результат`
        sheet.data = data

        const path = Path.join(UploadHelper.uploadFolder, filename)
        const out = Fs.createWriteStream(path);

        xlsx.on('finalize', function (written) {
          callback(null, {
            filename
          })
        });

        xlsx.on('error', callback);

        out.on('error', callback);

        xlsx.generate(out);

      })

  }

  static getAmount (offer, getDiscount) {
    const discount = getDiscount()
    let amount = offer.get('amount')
    if (discount) {
      amount = amount - discount * offer.get('amount')
    }
    return amount
  }

  static withdrawPayment (offer, cb) {
    return this._withdrawPayment(offer, () => {
      return this.getDiscount(offer)
    }, cb)
  }

  static withdrawTimeoutPayment (offer, cb) {
    return this._withdrawPayment(offer, () => {
      return this.maxDiscount()
    }, cb)
  }

  static _withdrawPayment (offer, getDiscount, cb) {

    Order.find(offer.get('order_id'), (error, order) => {

      if (error) {
        return cb(error)
      }

      Restaurant.find(offer.get('restaurant_id'), (error, restaurant) => {

        if (error) {
          return cb(error)
        }

        Axios({
            method: 'post',
            auth: {
              username: restaurant.get('cloudpayments_id'),
              password: restaurant.get('cloudpayments_password')
            },
            url: 'https://api.cloudpayments.kz/payments/confirm',
            data: {
              TransactionId: order.get('transaction_id'),
              Amount: this.getAmount(offer, getDiscount)
            }
          }
        ).then((response) => {

          if (!response.data.Success) {
            cb(new Error(response.data.Message))
          } else {
            cb()
          }

        }).catch(cb)

      })

    })

  }

  static holdPaymentCryptogram (offer, cryptogram, cb) {
    this.holdPayment(offer, { cryptogram }, cb)
  }

  static holdPaymentToken (offer, token, cb) {
    this.holdPayment(offer, { token }, cb)
  }

  static holdPayment (offer, options, cb) {

    Order.find(offer.get('order_id'), (error, order) => {

      if (error) {
        return cb(error)
      }

      Restaurant.find(offer.get('restaurant_id'), (error, restaurant) => {

        const data = {
          Currency: 'KZT',
          IpAddress: '10.0.0.1',
          Amount: offer.get('amount'),
          InvoiceId: order.get('id'),
          AccountId: 1
        }
        let apiPath

        if (options.cryptogram) {
          apiPath = 'cards'
          data.CardCryptogramPacket = options.cryptogram
        } else if (options.token) {
          apiPath = 'tokens'
          data.Token = options.token
        } else {
          throw new Error('wrong options')
        }

        Axios({
            method: 'post',
            auth: {
              username: restaurant.get('cloudpayments_id'),
              password: restaurant.get('cloudpayments_password')
            },
            url: `https://api.cloudpayments.kz/payments/${apiPath}/auth`,
            data
          }
        ).then((response) => {

          if (!response.data.Success) {
            if (response.data.Model) {
              if (response.data.Model.AcsUrl) {
                cb(null, Object.assign(this.get3dsData(response), {
                  TermUrl: process.env.BASE_URL + '/payment_result/' + offer.get('id') + '/' + order.get('hash')
                }))
              } else if (response.data.Model.CardHolderMessage) {
                cb(new Error(response.data.Model.CardHolderMessage))
              } else {
                cb(new Error('undefined cloudpayments error'))
              }
            } else if (response.data.Message) {
              cb(new Error(response.data.Message))
            } else {
              cb(new Error('undefined cloudpayments error 2'))
            }
          } else {
            cb(null, response.data.Model)
          }

        }).catch((err) => {
          console.log(err)
          cb(err)
        })

      })

    })

  }

  static get3dsData (response) {
    return {
      '3d': true,
      MD: response.data.Model.TransactionId,
      PaReq: response.data.Model.PaReq,
      AcsUrl: response.data.Model.AcsUrl
    }
  }

  static testHoldPayment (cryptogram, cb) {
    Axios({
        method: 'post',
        auth: {
          username: process.env.PAYMENT_PUBLIC_ID,
          password: process.env.PAYMENT_API_PASSWORD
        },
        url: 'https://api.cloudpayments.kz/payments/cards/auth',
        data: {
          CardCryptogramPacket: cryptogram,
          Currency: 'KZT',
          IpAddress: '10.0.0.1',
          AccountId: 1,
          Amount: 100
        }
      }
    ).then((response) => {
      if (!response.data.Success) {
        if (response.data.Model) {
          if (response.data.Model.AcsUrl) {
            cb(null, this.get3dsData(response))
          } else if (response.data.Model.CardHolderMessage) {
            cb(new Error(response.data.Model.CardHolderMessage))
          } else {
            cb(new Error('undefined cloudpayments error'))
          }
        } else if (response.data.Message) {
          cb(new Error(response.data.Message))
        } else {
          cb(new Error('undefined cloudpayments error 2'))
        }
      } else {
        Axios({
            method: 'post',
            auth: {
              username: process.env.PAYMENT_PUBLIC_ID,
              password: process.env.PAYMENT_API_PASSWORD
            },
            url: 'https://api.cloudpayments.kz/payments/void',
            data: {
              TransactionId: response.data.Model.TransactionId
            }
          }
        ).then(() => {
          cb(null, response.data.Model)
        }).catch(cb)
      }
    }).catch(cb)
  }

  static cancelPayment (transactionId, cb) {

    Offer.findBy('transaction_id', transactionId, (err, offer) => {

      if (err) {
        return cb(err)
      }

      Restaurant.find(offer.get('restaurant_id'), (err, restaurant) => {

        if (err) {
          return cb(err)
        }

        Axios({
            method: 'post',
            auth: {
              username: restaurant.get('cloudpayments_id'),
              password: restaurant.get('cloudpayments_password')
            },
            url: 'https://api.cloudpayments.kz/payments/void',
            data: {
              TransactionId: transactionId
            }
          }
        ).then(() => {
          cb(null)
        }).catch(cb)

      })

    })

  }

}

module.exports = RestaurantsHelper
