'use strict'

const Nodal = require('nodal')
const RestaurantsHelper = Nodal.require('app/helpers/restaurants_helper.js')
const payment3ds = Nodal.require('app/helpers/payment3ds_helper.js')
const Axios = require('axios')

class V1CardsController extends Nodal.Controller {

  post () {

    if (this.params.query.authorize3ds) {

      this.process3dsResult()

    } else {

      this.addCard()

    }

  }

  addCard () {

    if (!this.params.body.cryptogram) {
      return this.badRequest('cryptogram is required')
    }

    RestaurantsHelper.testHoldPayment(this.params.body.cryptogram, (error, result) => {

      if (error) {
        return this.respond(error)
      }

      if (result['3d']) {

        return this.respond(Object.assign(result, {
          TermUrl: process.env.BASE_URL + '/cards?authorize3ds=true'
        }))

      } else {

        this.respond({
          valid: true,
          token: result.Token
        })

      }

    })


  }

  getLink (link) {
    const prefix = process.env.BASE_URL
    return `${prefix}/cards/${link}`
  }

  process3dsResult () {

    payment3ds(
      process.env.PAYMENT_PUBLIC_ID,
      process.env.PAYMENT_API_PASSWORD,
      this.params.body,
      (result) => {

        Axios({
            method: 'post',
            auth: {
              username: process.env.PAYMENT_PUBLIC_ID,
              password: process.env.PAYMENT_API_PASSWORD
            },
            url: 'https://api.cloudpayments.kz/payments/void',
            data: {
              TransactionId: result.TransactionId
            }
          }
        ).then(() => {
          this.redirect(this.getLink(`success?token=${result.Token}`))
        }).catch(() => {
          this.redirect(this.getLink('fail'))
        })
      },
      () => {
        this.redirect(this.getLink('fail'))
      }
    )

  }


  get () {

    if (this.params.route.result === 'fail') {

      return this.respond({
        valid: false
      })

    } else if (this.params.route.result === 'success') {

      return this.respond({
        valid: true,
        token: this.params.query.token
      })

    } else {

      return this.badRequest()

    }

  }

}

module.exports = V1CardsController;