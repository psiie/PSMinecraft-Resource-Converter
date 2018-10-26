const fs = require('fs-extra');
const path = require('path');
const logger = require('../logger');

const tmpFolder = path.join(__dirname, '..', '..', 'tmp');

// Returns the path to the png
class ImageFile {
  constructor(fileName = '', uuid = '') {
    this.userDir = path.join(tmpFolder, uuid, '/assets/minecraft/textures/', fileName);
    this.defaultDir = path.join(__dirname, 'default_assets', '/assets/minecraft/textures', fileName);

    this.path404 = path.join(__dirname, 'default_assets', '404.png');
  }

  // Returns either the imported texturepack path or the default path
  get path() {
    let found = null;
    if (fs.existsSync(this.userDir)) found = this.userDir;
    else if (fs.existsSync(this.defaultDir)) found = this.defaultDir;
    else if (fs.existsSync(this.path404)) found = this.path404;

    if (!found) logger('ImageFile: While looking for a PNG, not only was it not found in the user dir, it also wasn\'t found in the default dir. The specified blank tile is also missing! Try reinstalling this app');
    return found || null;
  }
}

module.exports = ImageFile;
