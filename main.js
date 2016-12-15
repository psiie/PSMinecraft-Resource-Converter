var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
var path = 'lucid-1.9-beta/assets/minecraft/textures/blocks/'
var blockSprites = require('./block-sprites')

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
  fs.exists(folder, (exists) => {
    if (!exists) {
      fs.mkdir(folder, ()=>{console.log('created dir');})
    } else {
      console.log('no need to create dir');
    }
  });
}



// spritesheet = gm(undefined);

// blockSprites.forEach((sprite) => {
//   spritesheet.montage(path + sprite);
// })

// spritesheet
//   .geometry('16x16+0+0').tile('16x16')
//   .write('export/terrain.png', (err) => {if (!err) {console.log('written terrain')} })
  
// spritesheet
//   .geometry('8x8+0+0').tile('16x16')
//   .write('export/terrainMipMapLevel2.png', (err) => {if (!err) {console.log('written terrainMipMapLevel2')} })

// spritesheet
//   .geometry('4x4+0+0').tile('16x16')
//   .write('export/terrainMipMapLevel3.png', (err) => {if (!err) {console.log('written terrainMipMapLevel3')} })