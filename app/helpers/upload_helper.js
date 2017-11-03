'use strict'

const Fs = require('fs');
const Path = require('path');
const Nodal = require('nodal');
const Crypto = require('crypto');
const Errors = Nodal.require('config/errors.json');

class UploadHelper {

  static get uploadFolder () {
    return Path.join(Nodal.env.rootDirectory, '../upload')
  }

  static get allowedExtensions () {
    return [ '.jpg' ]
  }

  static getRandomName (originalName, ext) {
    const name = Crypto
      .createHmac('md5', Crypto.randomBytes(64).toString())
      .update(originalName + Date.now())
      .digest('hex')

    if (!ext) {
      return name
    }

    return `${name}${ext}`
  }

  static readFile (path, callback) {
    const filePath = Path.join(UploadHelper.uploadFolder, path)

    Fs.readFile(filePath, (err, data) => {

      if (err) {
        return callback(err)
      }

      return callback(null, data)
    })
  }

  static uploadFile ({ file, filename }, callback = () => {}) {
    if (!file || !filename) {
      return callback(new Error(Errors['FILE_IS_NOT_DEFINED']))
    }

    const ext = Path.extname(filename)

    if (!UploadHelper.allowedExtensions.includes(ext)) {
      return callback(new Error(Errors['EXTENSION_IS_NOT_ALLOWED']))
    }

    const randomName = UploadHelper.getRandomName(file.filename, ext)
    const filePath = Path.join(UploadHelper.uploadFolder, randomName)

    Fs.writeFile(filePath, file, (err) => {

      if (err) {
        return callback(err)
      }

      return callback(null, randomName)
    })
  }
}

module.exports = UploadHelper
