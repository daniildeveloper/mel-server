'use strict';

const Nodal = require('nodal');
const Order = Nodal.require('app/models/order.js');

class AveragePriceController extends Nodal.Controller {

  post () {

    const bag = this.params.body.client_order

    if (!bag) {
      return this.badRequest()
    }

    Order.checkBag(bag, (err, isOkay) => {

      if (err) {
        return this.respond(err);
      }

      if (!isOkay) {
        return this.respond(new Error('Bag is not okay'));
      }

      Order.getAveragePrice(bag, (err, price) => {

        if (err) {
          return this.respond(err)
        }

        this.respond({
          price: price
        })

      })

    })

  }

}

module.exports = AveragePriceController;
