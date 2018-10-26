const fs = require('fs-extra');
const path = require('path');
const JSZip = require("jszip");
const extract = require('extract-zip');


// const defaultDir = path.posix.join('assets/minecraft/textures', 'blocks', 'anvil_base.png');
const zipPath = path.join(__dirname, 'lucid-1.8.9.zip');
const buffer = fs.readFileSync(zipPath);

// JSZip.loadAsync(buffer).then(zip => {
//   const { files } = zip || {};
//   const fileList = Object.keys(files);
//   const isInZip = fileList.indexOf(defaultDir) !== -1;
//   console.log(isInZip)
// });


// extract(new Uint8Array(buffer), { dir: path.join(__dirname, 'tmp', 'userid')}, function (err) {
//  // extraction is complete. make sure to handle the err
//  if (err) console.log('err', err)
// })
