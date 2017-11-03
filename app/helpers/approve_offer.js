const Nodal = require('nodal')
const Async = require('async')
const Constants = Nodal.require('config/constants.js')
const Offer = Nodal.require('app/models/offer.js')
const Order = Nodal.require('app/models/order.js')

const approveOffer = (PubRedis, offer, order, cb) => {

  const tasks = {
    offerUpdate: (cb) => {
      Offer.update(offer.get('id'), { approved: true, approved_at: new Date() }, cb)
    },
    orderUpdate: (cb) => {
      Order.update(order.get('id'), { active: false }, cb)
    },
    sendPush: (cb) => {
      try {
        PubRedis.publish(Constants.RESTAURANT_PUSH_NEW_ACTIVE, JSON.stringify({
          offer: offer.toObject(),
          order: order.toObject()
        }))

        PubRedis.publish(Constants.TELEGRAM_NOTIFY_NEW_ACTIVE, JSON.stringify({
          offer: offer.toObject(),
          order: order.toObject()
        }))
      } catch (err) {
        return cb(err)
      }

      cb()
    }
  }

  Async.parallel(tasks, (err, res) => {
    if (err) {
      return cb(err)
    }
    cb(null, res.offerUpdate)
  })

}

module.exports = approveOffer
