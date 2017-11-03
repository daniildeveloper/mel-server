'use strict'

const Nodal = require('nodal')
const Order = Nodal.require('app/models/order.js');
const Constants = Nodal.require('config/constants.js')
const Restaurant = Nodal.require('app/models/restaurant.js');

class PushHelper {

  static get methods () {
    return {
      [ Constants.PUSH_NEW_OFFER ] ({ token, offer, order, restaurant }, callback) {
        if (!token || !offer || !restaurant) {
          return callback(null)
        }

        const text = `
          По Вашему заказу поступило новое предложение от ресторана "${restaurant.name}"
        `

        return callback('MOBILE', {
          token: token,
          text: text.trim(),
          type: Constants.PUSH_NEW_OFFER,
          data: { hash: order.hash }
        })
      },

      [ Constants.USER_NOTIFY_NEW_OFFERS ] ({ order }, callback) {
        if (!order) {
          return callback(null)
        }

        const text = `
          Вас ожидают предложения ресторанов
        `

        return callback('MOBILE', {
          token: order.push_token,
          text: text.trim(),
          type: Constants.USER_NOTIFY_NEW_OFFERS,
          data: { hash: order.hash }
        })
      },

      [ Constants.USER_NOTIFY_OFFER_CANCELED ] ({ order }, callback) {
        if (!order) {
          return callback(null)
        }

        const text = `
          К сожалению, Ваш заказ отменен рестораном.
        `

        return callback('MOBILE', {
          text: text.trim(),
          token: order.push_token,
          type: Constants.USER_NOTIFY_OFFER_CANCELED,
          data: { hash: order.hash }
        })
      },

      [ Constants.USER_NOTIFY_NO_OFFERS ] ({ order }, callback) {
        if (!order) {
          return callback(null)
        }

        const text = `
          К сожалению, по Вашему заказу не поступило предложений от ресторанов, заказ отменён. Попробуйте заказать другие блюда
        `

        return callback('MOBILE', {
          token: order.push_token,
          text: text.trim(),
          type: Constants.USER_NOTIFY_NO_OFFERS,
          data: { hash: order.hash }
        })
      },

      [ Constants.RESTAURANT_PUSH_NEW_ACTIVE ] ({ offer }, callback) {

        Restaurant.find(offer.restaurant_id, (err, model) => {

            if (err) {
              return callback()
            }

            return callback('WEB', {
              subscription: JSON.parse(model.get('push_token')),
              text: `Заказ №${offer.order_id} был принят клиентом!`
            })

        })

      },

      [ Constants.RESTAURANT_PUSH_NEW_ORDER ] ({ order }, callback) {

        Order.getBagCategories(order.client_order, (err, categories) => {

          if (err) {
            return callback()
          }

          Restaurant.getByCategoriesAndCity(categories, order, (err, res) => {

            if (err) {
              return callback()
            }

            const data = res.map((restaurant) => {
              return {
                subscription: JSON.parse(restaurant.push_token),
                text: 'В эфир поступил новый заказ'
              }
            })

            return callback('WEB', data)

          })

        })
      }
    }
  }

  static get methodsKeys () {
    return Object.keys(PushHelper.methods)
  }

  static parseMessage (event, message, callback) {
    const method = PushHelper.methods[event]
    return method && method(message, callback)
  }

}

module.exports = PushHelper;
