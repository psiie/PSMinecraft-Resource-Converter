const fs = require('fs-extra');
const path = require('path');
const gm = require('gm').subClass({ imageMagick: true });
const async = require('async');
const ImageFile = require('./ImageFile');
const logger = require('../logger');

const tmpFolder = path.join(__dirname, '..', '..', 'tmp');

class Sprites {
  constructor() {
    this.files = [];
    this.uuid = '';
    this.file404 = new ImageFile().path404;
  }

  _write(filename, gmSprite, callback) {
    const filePath = path.join(tmpFolder, this.uuid, 'CONVERTED', filename);
    const folderPath = path.dirname(filePath);
    if (!fs.pathExistsSync(folderPath)) fs.mkdirpSync(folderPath);
    gmSprite.write(filePath, error => {
      if (error) logger(`Sprites: error writing on ${filename}, ${error}`);
      else logger('Sprites: written' + filename);
      
      if (callback) callback(null);
    });

    return this;
  }

  config(conf) {
    this.files = (conf && conf.files) || [];
    return this;
  }

  setUUID(id) {
    this.uuid = id;
    return this;
  }

  convertAndSave(parentCallback) {
    const convert = (file, callback) => {
      const { tileDimensions, filenameInput, filenameOutput } = file;
      const png = new ImageFile(filenameInput, this.uuid).path;
      if (png === this.file404) {
        logger(`Sprites: missing ${filenameInput}, skipping...`);
        callback(null);
        return;
      }

      const gmSprite = gm(png).resize(tileDimensions[0], tileDimensions[1]).bitdepth(8).background('transparent');
      this._write(filenameOutput, gmSprite, callback);
    };

    async.each(this.files, convert, error => {
      if (error) logger('error in async each', error);
      if (parentCallback) parentCallback();
    });

    return this;
  }
}

module.exports = Sprites;
