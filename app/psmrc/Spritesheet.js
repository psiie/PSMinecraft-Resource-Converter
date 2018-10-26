const fs = require('fs-extra');
const path = require('path');
const gm = require('gm').subClass({ imageMagick: true });
const async = require('async');
const ImageFile = require('./ImageFile');
const logger = require('../logger');

const tmpFolder = path.join(__dirname, '..', '..', 'tmp');

class Spritesheet {
  constructor() {
    this.uuid = '';
    this.sheet = gm();
  }

  /* --------------------------  /
              Private
  /  -------------------------- */
  _write(geometry, writePath, callback) {
    const { tileDimensions } = this.config;
    const folderPath = path.dirname(writePath);
    if (!fs.pathExistsSync(folderPath)) fs.mkdirpSync(folderPath);
    this.sheet
      .geometry(geometry)
      .tile(tileDimensions)
      .write(writePath, error => {
        logger(error ? error : `Spritesheet: written ${writePath}`);
        if (callback) callback();
      });
    return this;
  }

  /* --------------------------  /
              Public
  /  -------------------------- */

  config(config) {
    const dim = config.spritesheetDimensions;
    this.config = config;
    this.sheet = gm(dim[0], dim[1])
      .bitdepth(8)
      .background('transparent');
    return this;
  }

  setUUID(id) {
    this.uuid = id;
    return this;
  }

  montage() {
    const { folder, files } = this.config;
    files.forEach(sprite => {
      const png = new ImageFile(path.join(folder, sprite), this.uuid).path;
      this.sheet.montage(png);
    });
    return this;
  }

  save(parentCallback) {
    const { filenameOutput } = this.config;
    const filePath = path.join(tmpFolder, this.uuid, 'CONVERTED', filenameOutput);
    const mipmap2Path = path.join(tmpFolder, this.uuid, 'CONVERTED', 'terrainMipMapLevel2.png');
    const mipmap3Path = path.join(tmpFolder, this.uuid, 'CONVERTED', 'terrainMipMapLevel3.png');

    const asyncFunctions = [
      callback => this._write('16x16+0+0', filePath, callback),
    ];
    
    // Only terrain.png has MipMapLevels
    if (filenameOutput === 'terrain.png') asyncFunctions.push(
      callback => this._write('8x8+0+0', mipmap2Path, callback),
      callback => this._write('4x4+0+0', mipmap3Path, callback),
    );

    async.parallel(asyncFunctions, (err, results) => {
      if (err) logger('error in psmrc async parallel fn.', err);
      if (parentCallback) parentCallback();
    });

    return this;
  }
}

module.exports = Spritesheet;
