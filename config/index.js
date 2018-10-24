const fs = require('fs-extra');
const path = require('path');

const blockSprites = fs.readFileSync(path.join(__dirname, 'sprites_block.json'), 'utf8');
const itemSprites = fs.readFileSync(path.join(__dirname, 'sprites_item.json'), 'utf8');
const singleSprites = fs.readFileSync(path.join(__dirname, 'sprites_single.json'), 'utf8');

module.exports = {
  blockSprites: JSON.parse(blockSprites),
  itemSprites: JSON.parse(itemSprites),
  singleSprites: JSON.parse(singleSprites),
};
