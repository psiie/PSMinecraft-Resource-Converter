var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
// import/default/
// var insidePath = ''
// blocks/
var blockSprites = require('./block-sprites')
var importDirectory = findImportDirectory(); // Declare so find only runs once

// ----------------- Create Output Directory Layout ----------------- //

var layout = [
  '/export',
  '/export/armor',
  '/export/font',
  '/export/item',
  '/export/misc',
  '/export/mob',
  '/export/textures'
]

layout.forEach((i)=>{
  makeLayout(__dirname + i);
})

function makeLayout(folder) {
  if (!fs.existsSync(folder)) {
    fs.mkdir(folder, ()=>console.log('created dir'));
  }
}

// ----------------- Helper Functions ----------------- //

function findImportDirectory() {
  console.log('running findImportDirectory :\\');
  // Returns a promise with the most likely folder to be importing
  var dir = new Promise((resolve, reject) => {
    fs.readdir(__dirname + '/import/', (err, list) => resolve(list))
  });
  return dir.then(list => {
    var mostLikely = 'default';
    list.forEach(i=>{ // Cycle through each folder. If not hidden or 'default'
      if (i !== 'default' && i[0] !== '.') {mostLikely = i}
    });
    return mostLikely;
  });
}

function findPNG(shortDirectory) {
  // Returns either the imported texturepack path or the default path
  return importDirectory.then(dir => {
    let userDir = __dirname + '/import/' + dir + '/assets/minecraft/textures/' + shortDirectory;
    let defaultDir = __dirname + '/import/default/assets/minecraft/textures/' + shortDirectory;
    // if (fs.existsSync(userDir)) {
    if (false) {
      return userDir;
    } else if (fs.existsSync(defaultDir)) {
      return defaultDir;
    } else {
      console.log("!!!ERROR!!! Report this filename: \"", shortDirectory, "\"");
      return __dirname + '/import/default/404.png';
    }
  })

}

// findPNG('blocks/gravel.png').then(i=>console.log(i))

// ----------------- Create Terrain Spritesheet ----------------- //

spritesheet = gm(256,512).background('transparent');

blockSprites.forEach((sprite) => {
  // console.log('here:','blocks/' + sprite);
  // spritesheet.montage(dir)
  // findPNG('blocks/' + sprite).then(dir => )
})

spritesheet
  .geometry('16x16+0+0').tile('16x32')
  .write('export/terrain.png', (err) => {
    if (!err) {console.log('written terrain')} 
    else {console.log(err);}
  })
  
// spritesheet
//   .geometry('8x8+0+0').tile('16x32')
//   .write('export/terrainMipMapLevel2.png', (err) => {
//     if (!err) {console.log('written terrainMipMapLevel2')} 
//   })

// spritesheet
//   .geometry('4x4+0+0').tile('16x32')
//   .write('export/terrainMipMapLevel3.png', (err) => {
//     if (!err) {console.log('written terrainMipMapLevel3')} 
//   })

