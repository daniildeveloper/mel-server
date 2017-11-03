'use strict'

const Nodal = require('nodal');
const Async = require('async');
const Adapter = Nodal.require('db/main.js');
const User = Nodal.require('app/models/user.js');
const Errors = Nodal.require('config/errors.json');
const Order = Nodal.require('app/models/order.js');
const Constants = Nodal.require('config/constants.js');
const Restaurant = Nodal.require('app/models/restaurant.js');

const getFrontendLink = function (orderId) {
  const development = 'https://test.melamenu.com/onair/main'
  const production = 'https://www.melamenu.com/panel/onair/main'
  const isProduction = process.env.NODE_ENV === 'production'
  const prefix = isProduction ? production : development
  return `${prefix}/${orderId}`
}

class TelegramHelper {

  static findTelegramRooms (id, callback) {
    const parsedId = id instanceof Array ? id : [ id ]

    if (!parsedId || !parsedId.length) {
      return callback(new Error('No rooms found'))
    }

    const query = `
      SELECT
        telegram_chat_settings as settings
      FROM
        users
      WHERE
        id IN (${parsedId.join(',')}) AND
        telegram_chat_settings is not null
    `

    Adapter.query(query, [], (err, res) => {

      if (err) {
        return callback(err)
      }

      const rooms = res.rows.reduce((acc, setup) => {
        if (setup.settings instanceof Array) {
          const innerRooms = setup.settings.map(r => r.id)
          acc.push(...innerRooms)
        }
        else {
          acc.push(setup.settings.id)
        }

        return acc
      }, [])

      return callback(null, rooms)
    })

  }

  static get methods () {
    return {
      [ Constants.TELEGRAM_NOTIFY_NEW_ACTIVE ] ({ order, offer }, callback) {

        Restaurant.find(offer.restaurant_id, (err, model) => {

            if (err) {
              return callback()
            }

            TelegramHelper.findTelegramRooms(model.get('admin_id'), (err, rooms) => {

              if (err) {
                return callback()
              }

              return callback(rooms, `Пользователь принял ваше предложение! Заказ №${order.id} был перемещен во вкладку "Активные". Пин-код — ${offer.pin_code}.`)

            })

        })

      },

      [ Constants.TELEGRAM_NOTIFY_DELIVERED ] ({ order, offer }, callback) {

        Restaurant.find(offer.restaurant_id, (err, model) => {

            if (err) {
              return callback()
            }

            TelegramHelper.findTelegramRooms(model.get('admin_id'), (err, rooms) => {

              if (err) {
                return callback()
              }

              return callback(rooms, `Заказ №${order.id} был доставлен по адресу "${order.client_address}", сумма заказа - ${offer.total}тг.`)

            })

        })

      },

      [ Constants.TELEGRAM_NOTIFY_NEW_ORDER ] ({ order }, callback) {

        Order.getBagCategories(order.client_order, (err, categories) => {

          if (err) {
            return callback()
          }

          Restaurant.getByCategoriesAndCity(categories, order, (err, list) => {

            if (err) {
              return callback()
            }

            const admins = list.reduce((memo, r) => {
              if (r.admin_id) {
                memo.push(r.admin_id)
              }
              return memo
            }, [])

            TelegramHelper.findTelegramRooms(admins, (err, rooms) => {

              if (err) {
                return callback()
              }

              Order.getDetails(order.id, (err, details) => {
                const link = getFrontendLink(order.id)
                const text = `В эфире появился [новый заказ №${order.id}](${link})`

                if (err) {
                  return callback(rooms, text)
                }

                const detailedText = `${text}: \n${details}`

                return callback(rooms, detailedText)
              })
            })

          })

        })
      },

      [ Constants.TELEGRAM_NOTIFY_NEGATIVE_BALANCE ] ({ restaurant }, callback) {

        TelegramHelper.findTelegramRooms(restaurant.admin_id, (err, rooms) => {

          return callback(rooms, `Отрицательный баланс у ресторана "${restaurant.name}" (${restaurant.bill} тг).`)

        })

      },

      [ Constants.TELEGRAM_NOTIFY_BALANCE_CHANGED ] ({ restaurant }, callback) {

        TelegramHelper.findTelegramRooms(restaurant.admin_id, (err, rooms) => {

          return callback(rooms, `Баланс ресторана "${restaurant.name}" пополнен на ${restaurant.payment_amount} тг. Текущий баланс: ${restaurant.bill} тг.`)

        })

      }
    }
  }

  static get methodsKeys () {
    return Object.keys(TelegramHelper.methods)
  }

  static findUserByToken (token, cb) {
    const query = `
      SELECT
        *
      FROM
        users
      WHERE
        telegram_token::text[] @> ARRAY[$1]
      LIMIT 1
    `

    Adapter.query(query, [ token ], (err, res) => {

      if (err) {
        return cb(err)
      }

      if (!res || !res.rows || !res.rows.length) {
        return cb(null, result)
      }

      return cb(null, new User(res.rows.pop()))

    })
  }

  static onHelp (ctx) {
    ctx.reply('Привет!\nЧтобы пользоваться ботом нужно сначала зарегистрироваться! Если вы этого еще не сделали, введите /register <token>, где <token> — это переданный вам сотрудниками Melamenu специальный код доступа для Вашего ресторана. После регистрации Вам будут доступны уведомления о поступлении новых заказов и подтверждениях со стороны пользователей.')
  }

  static onRegister (ctx) {
    const token = (ctx.message.text.split(' ').pop() || '').trim()

    TelegramHelper.findUserByToken(token, (err, user) => {

      if (err) {
        return ctx.reply('Мы не можем найти пользователя с таким токеном доступа. Обратитесь в службу поддержки через веб-интерфейс или приложение')
      }

      Restaurant.getByUserId(user.get('id'), (err, model) => {

        if (err) {
          return ctx.reply('Ваш пользователь не связан ни с одним рестораном')
        }

        let chatRooms = user.get('telegram_chat_settings')

        if (chatRooms instanceof Array !== true) {
          chatRooms = chatRooms ? [ chatRooms ] : []
        }

        chatRooms.push(ctx.message.chat)

        const options = {
          telegram_chat_settings: chatRooms
        }

        User.update(user.get('id'), options, (err) => {

          if (err) {
            return ctx.reply(`При выполнении вашего запроса произошла ошибка`)
          }

          return ctx.reply(`Вы зарегистрировались как ресторан "${model.get('name')}". Теперь вы будете получать уведомления о поступающих заказах в этот чат.`)

        })

      })

    })
  }

  static onUnRegister (ctx) {
    const token = (ctx.message.text.split(' ').pop() || '').trim()

    TelegramHelper.findUserByToken(token, (err, user) => {

      if (err) {
        return ctx.reply('Мы не можем найти пользователя с таким токеном доступа. Обратитесь в службу поддержки через веб-интерфейс или приложение')
      }

      Restaurant.getByUserId(user.get('id'), (err, model) => {

        if (err) {
          return ctx.reply('Ваш пользователь не связан ни с одним рестораном')
        }

        let chatRooms = user.get('telegram_chat_settings') || []

        if (chatRooms instanceof Array !== true) {
          chatRooms = [ chatRooms ]
        }

        chatRooms = chatRooms.filter((room) => {
          return room.id !== ctx.message.chat.id
        })

        const options = {
          telegram_chat_settings: chatRooms
        }

        User.update(user.get('id'), options, (err) => {

          if (err) {
            return ctx.reply(`При выполнении вашего запроса произошла ошибка`)
          }

          return ctx.reply(`Теперь вы не будете получать уведомления`)

        })

      })

    })
  }

  static parseMessage (event, json, callback) {
    const method = TelegramHelper.methods[event]
    return method && method(json, callback)
  }

}

module.exports = TelegramHelper
