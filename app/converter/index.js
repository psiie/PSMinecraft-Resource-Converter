const fs = require('fs-extra');
const unzip = require('extract-zip');
const config = require('../../config');
const path = require('path');
const { Sprites, Spritesheet } = require('../psmrc');
const archiver = require('archiver');
const async = require('async');
const logger = require('../logger');

const tmpFolder = path.join(__dirname, '..', '..', 'tmp');
const { blockSprites, itemSprites, singleSprites } = config || {};

class Converter {
  constructor(sessionId, res) {
    this.res = res;
    this.sessionId = sessionId;
  }

  error(statusCode, errorText) {
    logger('error in Convert class:', statusCode, errorText);
    if (!this.res) return;

    this.res.status(statusCode)
    this.res.send(errorText);
    this.res = null;
  }

  zip() {
    // Create a zip archive
    const archive = archiver('zip');
    const fileName = path.join(tmpFolder, this.sessionId, 'converted.zip');
    let fileOutput = fs.createWriteStream(fileName);

    archive.pipe(fileOutput);
    archive.glob("**/*", { cwd: path.join(tmpFolder, this.sessionId, 'CONVERTED') });
    archive.on('error', err => this.error(500, `zip: error while archiving zip + ${err}`));
    archive.finalize();

    fileOutput.on('close', () => {
      logger('zip:', archive.pointer() + ' total bytes');
      fs.remove(path.join(tmpFolder, this.sessionId, 'CONVERTED'));
      fileOutput = undefined;
      if (this.res) this.res.send(`download/${this.sessionId}`);
    });
  }

  compile() {
    const onAsyncFinish = err => {
      if (err) { this.error(500, `Error during sprite conversion. Try another pack or version: ${err}`); return; }
      this.zip();
    };

    const asyncFunctions = [
      // Simple convert & copy sprites - are already individual tiles in PSV
      callback => {
        new Sprites()
          .setUUID(this.sessionId)
          .config(singleSprites)
          .convertAndSave(callback)
      },
      // Input sprite tiles and export them as a spritesheet for the PSV
      callback => {
        new Spritesheet()
          .setUUID(this.sessionId)
          .config(blockSprites)
          .montage()
          .save(callback);
      },
      callback => {
        new Spritesheet()
          .setUUID(this.sessionId)
          .config(itemSprites)
          .montage()
          .save(callback);
      },
    ];

    async.parallel(asyncFunctions, onAsyncFinish);
  }

  unzip(file, uploadDir) {
    logger('onFileReceived:', file.path);
    if (!file) { this.error(404, 'No file receieved on server'); return; }

    unzip(file.path, { dir: uploadDir }, err => {
      if (err) { this.error(500, 'unable to extract zip file that was uploaded'); return; }
      fs.remove(file.path, err => { if (err) logger('onFileReceived:', 'unable to delete user-uploaded zip file'); });
      this.compile();
    });
  }
}

module.exports = Converter;
