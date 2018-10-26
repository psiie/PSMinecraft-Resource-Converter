const fs = require('fs-extra');
const unzip = require('extract-zip');
const config = require('./config');
const path = require('path');
const { Sprites, Spritesheet } = require('./psmrc');
const archiver = require('archiver');
const async = require('async');

const { blockSprites, itemSprites, singleSprites } = config || {};

function zip(sessionId, res) {
  // Create a zip archive
  const archive = archiver('zip');
  const fileName = path.join(__dirname, 'tmp', sessionId, 'converted.zip');
  let fileOutput = fs.createWriteStream(fileName);

  archive.pipe(fileOutput);
  archive.glob("**/*", { cwd: path.join(__dirname, 'tmp', sessionId, 'CONVERTED') });
  archive.on('error', err => console.log('zip: error while archiving zip', err));
  archive.finalize();

  fileOutput.on('close', () => {
    console.log('zip:', archive.pointer() + ' total bytes');
    fs.remove(path.join(__dirname, 'tmp', sessionId, 'CONVERTED'));
    // cleanup.cleanByCookie(cookie);
    fileOutput = undefined;
    console.log('totally done with zip too')
    res.send(`download/${sessionId}`);
    // res.sendFile(path.join(__dirname, 'tmp', sessionId, 'converted.zip'));
  });
}

function buildPack(sessionId, res) {
  const onAsyncFinish = (err, results) => {
    if (err) console.log('error on parent async processes:', err);
    console.log('------ completely finished!', results);
    zip(sessionId, res);
  };

  const asyncFunctions = [
    // Simple convert & copy sprites - are already individual tiles in PSV
    callback => {
      new Sprites()
        .setUUID(sessionId)
        .config(singleSprites)
        .convertAndSave(callback)
    },
    // Input sprite tiles and export them as a spritesheet for the PSV
    callback => {
      new Spritesheet()
        .setUUID(sessionId)
        .config(blockSprites)
        .montage()
        .save(callback);
    },
    callback => {
      new Spritesheet()
        .setUUID(sessionId)
        .config(itemSprites)
        .montage()
        .save(callback);
    },
  ];

  async.parallel(asyncFunctions, onAsyncFinish);
}


function onFileReceived(file, uploadDir, sessionId, res) {
  console.log('onFileReceived:', file.path);
  if (!file) { res.status(501).end('No file receieved on server'); return; }

  unzip(file.path, { dir: uploadDir }, err => {
    if (err) { res.status(502).end('unable to extract zip file that was uploaded'); return; }
    fs.remove(file.path, err => {
      if (err) console.log('onFileReceived:', 'unable to delete user-uploaded zip file');
    });
    buildPack(sessionId, res);
  });
}

module.exports = {
  onFileReceived,
}

// todo: set all status codes correctly
