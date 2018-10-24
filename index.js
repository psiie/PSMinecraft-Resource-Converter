const fs = require('fs-extra');
const path = require('path');
const gm = require('gm').subClass({imageMagick: true});
const config = require('./config');
const singleSprites = require('./config/single-sprites.js');

const path404 = path.join(__dirname, 'import/default/404.png');
const importDirectory = findImportDirectory();
const exportStructure = [
  '/export',
  '/export/art',
  '/export/textures'
  // '/export/armor',
  // '/export/font',
  // '/export/item',
  // '/export/misc',
  // '/export/mob',
];

exportStructure.forEach(i => fs.mkdirp(path.join(__dirname, i)));

// ----------------- Directory Functions ----------------- //

function findImportDirectory() {
  console.log('running findImportDirectory :\\');
  const folders = fs.readdirSync(path.join(__dirname, 'import/'));
  if (!folders) throw 'No folders returned when looking in import/. Not even the included (and required) \'default/\'';

  let found;
  folders.forEach(folder => { // Cycle through each folder. If not hidden or 'default'
    if (folder !== 'default' && folder[0] !== '.') found = folder;
  });

  if (!found) throw 'no folder found in import/ (\'default\' excluding';
  return path.join(__dirname, found);
}

function findPNG(filePath) {
  // Returns either the imported texturepack path or the default path
  const dir = importDirectory;
  const userDir = path.join(dir, '/assets/minecraft/textures/', filePath);
  const defaultDir = path.join(__dirname, 'import/default/assets/minecraft/textures', filePath);
  
  let found = null;
  if (fs.existsSync(userDir)) found = userDir;
  else if (fs.existsSync(defaultDir)) found = defaultDir;
  else if (fs.existsSync(path404)) found = path404;

  if (!found) throw 'While looking for a PNG, not only was it not found in the user dir, it also wasn\'t found in the default dir. The specified blank tile is also missing! Try reinstalling this app';
  return found;
}


// ----------------- Imagemagick Functions ----------------- //

function simpleConvert() {
  singleSprites.forEach(file => {
    const resizeX = file[0],
          resizeY = file[1],
          importPath = file[2],
          outputPath = file[3];

    const dir = findPNG(importPath);
    if (dir === path404) {
      console.log(`missing ${importPath}, skipping...`);
      return;
    }

    console.log(dir);

    const out = path.join('export', outputPath);
    const onSuccess = error => {
      if (error) console.log(`error writing on ${outputPath}, ${error}`);
      else console.log('written ' + outputPath);
    };

    gm(dir).resize(resizeX, resizeY).bitdepth(8).background('transparent').write(out, onSuccess);
  });
}

function createPsmSpritesheet(configItem) {
  const { spritesheetDimensions, folder, files } = configItem;
  const spritesheet = gm(spritesheetDimensions[0], spritesheetDimensions[1]).bitdepth(8).background('transparent');

  files.forEach(sprite => {
    const dir = findPNG(path.join(folder, sprite));
    spritesheet.montage(dir);
  });

  saveSheet(spritesheet, configItem);
}

function saveSheet(spritesheet, configItem) {
  const { filenameOutput, tileDimensions } = configItem;
  const filePath = path.join('export', filenameOutput);
  const mipmap2Path = path.join('export', 'terrainMipMapLevel2.png');
  const mipmap3Path = path.join('export', 'terrainMipMapLevel3.png');
  const onSuccess = err => {
    if (err) console.log(err);
    else if (filenameOutput === 'terrain.png') console.log('written MipMap');
    else console.log(`written ${filenameOutput}`);
  };

  spritesheet.geometry('16x16+0+0').tile(tileDimensions).write(filePath, onSuccess);
  if (filenameOutput !== 'terrain.png') return; // Only terrain.png has MipMapLevels
  spritesheet.geometry('8x8+0+0').tile(tileDimensions).write(mipmap2Path, onSuccess);
  spritesheet.geometry('4x4+0+0').tile(tileDimensions).write(mipmap3Path, onSuccess);
}

// ----------------- MAIN ----------------- //

function main() {
  // For each item defined in config/index.js, create a spritesheet.
  Object.keys(config).forEach(item => createPsmSpritesheet(config[item]));

  // Copy Destroy Stages 0-9
  simpleConvert();
}

main();