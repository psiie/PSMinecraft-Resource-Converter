const fs = require('fs-extra');
const path = require('path');
const gm = require('gm').subClass({imageMagick: true});

// Returns the directory that the user added into imports/
class UserDirectory {
  constructor(dirPath) {
    this.found;
    this.dirPath = dirPath || __dirname;
    this.folders = fs.readdirSync(path.join(this.dirPath, 'import/')) || [];
    this.folders.forEach(folder => { // Cycle through each folder. If not hidden or 'default'
      if (folder !== 'default' && folder[0] !== '.') this.found = folder;
    });
  }

  get path() {
    if (!this.found) return null;
    return path.join(this.dirPath, this.found);
  }
}

// Returns the path to the png
class ImageFile {
  constructor(fileName = '') {
    // Returns either the imported texturepack path or the default path
    this.directory = new UserDirectory().path;
    this.userDir = path.join(this.directory, '/assets/minecraft/textures/', fileName);
    this.defaultDir = path.join(__dirname, 'import/default/assets/minecraft/textures', fileName);
    this.path404 = path.join(__dirname, 'import/default/404.png');
  }

  get path() {
    let found = null;
    if (fs.existsSync(this.userDir)) found = this.userDir;
    else if (fs.existsSync(this.defaultDir)) found = this.defaultDir;
    else if (fs.existsSync(this.path404)) found = this.path404;

    if (!found) console.log('While looking for a PNG, not only was it not found in the user dir, it also wasn\'t found in the default dir. The specified blank tile is also missing! Try reinstalling this app');
    return found || null;
  }
}

class Sprites {
  constructor(params) {
    this.files = [];
    this.file404 = new ImageFile().path404;
    this.gm = gm();
  }

  _write(filename) {
    const filePath = path.join('export', filename);
    const folderPath = path.dirname(filePath);
    if (!fs.pathExistsSync(folderPath)) fs.mkdirpSync(folderPath);
    this.gm.write(filePath, error => {
      if (error) console.log(`error writing on ${filename}, ${error}`);
      else console.log('written ' + filename);
    });
  }

  config(conf) {
    this.files = (conf && conf.files) || [];
    return this;
  }

  convertAndSave() {
    this.files.forEach(file => {
      const { tileDimensions, filenameInput, filenameOutput } = file;

      const png = new ImageFile(filenameInput).path;
      if (png === this.file404) {
        console.log(`missing ${filenameInput}, skipping...`);
        return;
      }

      console.log(png);

      this.gm = gm(png).resize(tileDimensions[0], tileDimensions[1]).bitdepth(8).background('transparent');
      this._write(filenameOutput);
    })
  }
}

class Spritesheet {
  constructor() {
    this.sheet = gm();
  }

  /* --------------------------  /
              Private
  /  -------------------------- */
  _write(geometry, writePath) {
    const { tileDimensions } = this.config;
    const folderPath = path.dirname(writePath);
    if (!fs.pathExistsSync(folderPath)) fs.mkdirpSync(folderPath);
    this.sheet
      .geometry(geometry)
      .tile(tileDimensions)
      .write(writePath, err => console.log(err ? err : `written ${writePath}`));
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

  montage() {
    const { folder, files } = this.config;
    files.forEach(sprite => {
      const png = new ImageFile(path.join(folder, sprite)).path;
      this.sheet.montage(png);
    });
    return this;
  }

  save() {
    const { filenameOutput } = this.config;
    const filePath = path.join('export', filenameOutput);
    const mipmap2Path = path.join('export', 'terrainMipMapLevel2.png');
    const mipmap3Path = path.join('export', 'terrainMipMapLevel3.png');

    this._write('16x16+0+0', filePath);
    if (filenameOutput !== 'terrain.png') return this; // Only terrain.png has MipMapLevels
    this._write('8x8+0+0', mipmap2Path);
    this._write('4x4+0+0', mipmap3Path);
    return this;
  }
}

module.exports = {
  Sprites,
  Spritesheet,
};
