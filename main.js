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
    // if (false) {
    if (fs.existsSync(userDir)) {
      return userDir;
    } else if (fs.existsSync(defaultDir)) {
      return defaultDir;
    } else {
      console.log("!!!ERROR!!! Report this filename: \"", shortDirectory, "\"");
      return __dirname + '/import/default/404.png';
    }
  })
}


function saveSheet(spritesheet, filename) {
  console.log('ran saver function');
  spritesheet
    .geometry('16x16+0+0').tile('16x32')
    .write(filename, (err) => {
      if (!err) {console.log('written', filename)} 
      else {console.log(err);}
    })

  if (filename == 'export/terrain.png') {
    // Only terrain.png has MipMapLevels
    spritesheet
      .geometry('8x8+0+0').tile('16x32')
      .write('export/terrainMipMapLevel2.png', (err) => {
        if (!err) {console.log('written terrainMipMapLevel2')} 
      })

    spritesheet
      .geometry('4x4+0+0').tile('16x32')
      .write('export/terrainMipMapLevel3.png', (err) => {
        if (!err) {console.log('written terrainMipMapLevel3')} 
      })  
  }
}


// console.log( await findPNG('blocks/gravel.png') );
// findPNG('blocks/gravel.png').then(i=>console.log(i))

// ----------------- Create Terrain Spritesheet ----------------- //

function montageEach(spritesheet, sprites) {
  // Recursive function to allow successive Promises to resolve in sequence
  let counter = 0;
  let apply = function(spritesheet, sprites) {
    findPNG('blocks/' + sprites[counter]).then(dir => {
      spritesheet.montage(dir);
      if (counter < sprites.length-1) {
        counter += 1;
        apply(spritesheet, sprites);
      } else {
        saveSheet(spritesheet, 'export/terrain.png');
      }
    });
  }
  apply(spritesheet, sprites);
}

spritesheet = gm(256,512).background('transparent');
montageEach(spritesheet, blockSprites)









// blockSprites.forEach((sprite) => {
//   findPNG('blocks/' + sprite).then(dir => spritesheet.montage(dir))
// })