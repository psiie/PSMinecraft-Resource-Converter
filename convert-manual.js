const config = require('./config');
const { Sprites, Spritesheet } = require('./psmrc');
const { blockSprites, itemSprites, singleSprites } = config || {};

// Simple convert & copy sprites - are already individual tiles in PSV
new Sprites()
  .config(singleSprites)
  .convertAndSave();

// Input sprite tiles and export them as a spritesheet for the PSV
new Spritesheet()
  .config(blockSprites)
  .montage()
  .save();

new Spritesheet()
  .config(itemSprites)
  .montage()
  .save();
