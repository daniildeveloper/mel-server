'use strict';

const Nodal = require('nodal');
const Types = require('mime-types');
const UploadHelper = Nodal.require('app/helpers/upload_helper.js');

class UploadController extends Nodal.Controller {

  get() {
    const path = this.params.route.id

    UploadHelper.readFile(path, (err, data) => {

      if (err) {
        return this.respond(err)
      }

      const type = Types.lookup(path)

      this.setHeader('Content-Type', type);
      this.setHeader(`Content-Disposition`, `attachment; filename='${path}'`);

      this.render(data)

    })
  }
}

module.exports = UploadController;
