const fs = require('fs-extra');
const path = require('path');
const gm = require('gm').subClass({imageMagick: true});
const async = require('async');
// const JSZip = require("jszip");

// const zipFile = fs.readFileSync(path.join(__dirname, 'lucid-1.8.9.zip'));
// JSZip.loadAsync(zipFile).then(zip => {
//   console.log(Object.keys(zip.files))
// });
// class 

// Returns the directory that the user added into imports/
// class UserDirectory {
//   constructor(dirPath) {
//     this.found;
//     this.dirPath = dirPath || __dirname;
//     this.folders = fs.readdirSync(path.join(this.dirPath, 'import/')) || [];
//     this.folders.forEach(folder => { // Cycle through each folder. If not hidden or 'default'
//       if (folder !== 'default' && folder[0] !== '.') this.found = folder;
//     });
//   }

//   get path() {
//     if (!this.found) return null;
//     return path.join(this.dirPath, this.found);
//   }
// }

// class ZipFile {
//   constructor() {
//     this.zip = new Promise();
//   }

//   open(path) {
//     const buffer = fs.readFileSync(path);
//     this.zip = JSZip.loadAsync(buffer);
//   }

//   file(path) {
//     return new Promise((resolve, reject) => {
//       this.zip.files
//     });
//   }
// }

// Returns the path to the png
class ImageFile {
  constructor(fileName = '', uuid = '') {
    this.userDir = path.join(__dirname, 'tmp', uuid, '/assets/minecraft/textures/', fileName);
    this.defaultDir = path.join(__dirname, 'default_assets', '/assets/minecraft/textures', fileName);

    this.path404 = path.join(__dirname, 'default_assets', '404.png');
  }

  // Returns either the imported texturepack path or the default path
  get path() {
    let found = null;
    if (fs.existsSync(this.userDir)) found = this.userDir;
    else if (fs.existsSync(this.defaultDir)) found = this.defaultDir;
    else if (fs.existsSync(this.path404)) found = this.path404;

    if (!found) console.log('ImageFile: While looking for a PNG, not only was it not found in the user dir, it also wasn\'t found in the default dir. The specified blank tile is also missing! Try reinstalling this app');
    return found || null;
  }
}

class Sprites {
  constructor(params) {
    this.files = [];
    this.uuid = '';
    this.file404 = new ImageFile().path404;
  }

  _write(filename, gmSprite, callback) {
    const filePath = path.join(__dirname, 'tmp', this.uuid, 'CONVERTED', filename);
    const folderPath = path.dirname(filePath);
    if (!fs.pathExistsSync(folderPath)) fs.mkdirpSync(folderPath);
    gmSprite.write(filePath, error => {
      if (error) console.log(`Sprites: error writing on ${filename}, ${error}`);
      else console.log('Sprites2: written' + filename);
      
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
    console.log('running convert and save')

    const convert = (file, callback) => {
      const { tileDimensions, filenameInput, filenameOutput } = file;
      const png = new ImageFile(filenameInput, this.uuid).path;
      if (png === this.file404) {
        console.log(`Sprites: missing ${filenameInput}, skipping...`);
        callback(null);
        return;
      }

      const gmSprite = gm(png).resize(tileDimensions[0], tileDimensions[1]).bitdepth(8).background('transparent');
      this._write(filenameOutput, gmSprite, callback);
    };

    console.log('number of files:', this.files.length)
    // todo: does not finish on it's own. need a more stable method
    async.each(this.files, convert, error => {
      if (error) console.log('error in async each', error);
      console.log('--- done with child async each!');
      if (parentCallback) parentCallback();
    });

    return this;
  }
}

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
        console.log(error ? error : `Spritesheet: written ${writePath}`);
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
    const filePath = path.join(__dirname, 'tmp', this.uuid, 'CONVERTED', filenameOutput);
    const mipmap2Path = path.join(__dirname, 'tmp', this.uuid, 'CONVERTED', 'terrainMipMapLevel2.png');
    const mipmap3Path = path.join(__dirname, 'tmp', this.uuid, 'CONVERTED', 'terrainMipMapLevel3.png');

    const asyncFunctions = [
      callback => this._write('16x16+0+0', filePath, callback),
    ];
    
    // Only terrain.png has MipMapLevels
    if (filenameOutput === 'terrain.png') asyncFunctions.push(
      callback => this._write('8x8+0+0', mipmap2Path, callback),
      callback => this._write('4x4+0+0', mipmap3Path, callback),
    );

    async.parallel(asyncFunctions, (err, results) => {
      if (err) console.log('error in psmrc async parallel fn.', err);
      console.log('--- child spritesheet async done', results);
      
      if (parentCallback) parentCallback();
    });

    return this;
  }
}

module.exports = {
  Sprites,
  Spritesheet,
};
