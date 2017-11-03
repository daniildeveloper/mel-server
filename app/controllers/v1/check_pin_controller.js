'use strict';

const Nodal = require('nodal');
const Offer = Nodal.require('app/models/offer.js');
const Errors = Nodal.require('config/errors.json');

class CheckPinController extends Nodal.Controller {

  get() {

    const id = this.params.route.id;

    if (!id || Number.isNaN(parseInt(id))) {
      return this.badRequest();
    }

    const options = {
      id: id,
      pin_code: this.params.query.pin_code
    }

    Offer
    .query()
    .where(options)
    .end((err, res) => {

      if (err || res.length === 0) {
        return this.respond(new Error(Errors['PIN_CHECK_FAILED']))
      }

      this.respond({ ok: true })

    })

  }

}

module.exports = CheckPinController;
