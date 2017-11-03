'use strict';

const Nodal = require('nodal');
const AuthController = Nodal.require('app/controllers/auth_controller.js');
const Restaurant = Nodal.require('app/models/restaurant.js');

class V1BillController extends AuthController {

  publicId() {
    this.respond(process.env.PAYMENT_PUBLIC_ID)
  }

  bill() {
    this.authorize((err, token, user) => {
      if (err) {
        return this.respond(err)
      }
      Restaurant.findBy('admin_id', user.get('id'), (err, restaurant) => {
        if (err) {
          return this.notFound(err.toString())
        }
        if (!restaurant) {
          return this.notFound('User has no restaurant')
        }
        this.respond(restaurant.get('bill'))
      })
    })
  }

  get() {
    if (this.params.route.action && this.params.route.action === 'id') {
      this.publicId()
    } else {
      this.bill()
    }
  }

}

module.exports = V1BillController;
