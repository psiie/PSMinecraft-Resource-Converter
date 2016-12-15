var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
var path = 'lucid-1.9-beta/assets/minecraft/textures/blocks/'
var sprites = [
  "gravel.png",
  "stone.png",
  "dirt.png",
  "grass_side.png",
  "planks_oak.png",
  "stone_slab_side.png",
  "stone_slab_top.png",
  "brick.png",
  "tnt_side.png",
  "tnt_top.png",
  "tnt_bottom.png",
  "web.png",
  "flower_rose.png",
  "flower_dandelion.png",
  "water_still.png",
  "sapling_birch.png",
  "cobblestone.png",
  "bedrock.png",
  "sand.png",
  "gravel.png"
]


spritesheet = gm(undefined);
sprites.forEach((sprite) => {
  spritesheet.montage(path + sprite);
})

spritesheet
  .geometry('16x16+0+0').tile('16x16')
  .write('EXPORT.png', (err) => {if (!err) {console.log('written montage image :)')} })




// gm(undefined)
  // .montage('lucid-1.9-beta/assets/minecraft/textures/blocks/gold_block.png')
  // .montage('lucid-1.9-beta/assets/minecraft/textures/blocks/bookshelf.png')
  
