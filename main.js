var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
// import/default/
var path = 'assets/minecraft/textures/blocks/'
var blockSprites = require('./block-sprites')
// var importDirectory = await findImportDirectory()
console.log("AWAITED", await findImportDirectory());

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
  // Returns a promise with the most likely folder to be importing
  var dir = new Promise((resolve, reject) => {
    fs.readdir(__dirname + '/import/', (err, list) => resolve(list))
  });

  return dir.then(list => {
    var mostLikely = 'default';
    list.forEach(i=>{ // Cycle through each folder. If not hidden or 'default'
      if (i !== 'default' && i[0] !== '.') {mostLikely = i}
    })
    return mostLikely;
  })

}
findImportDirectory().then(i=>console.log(i))

function checkForPNG() {}

// ----------------- Create Terrain Spritesheet ----------------- //

spritesheet = gm(256,512).background('transparent');

blockSprites.forEach((sprite) => {
  spritesheet.montage( __dirname + '/import/default/' + path + sprite);
})

spritesheet
  .geometry('16x16+0+0').tile('16x32')
  .write('export/terrain.png', (err) => {
    if (!err) {console.log('written terrain')} 
    else {console.log(err);}
  })
  
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

