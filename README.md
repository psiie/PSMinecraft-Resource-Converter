![CandyCraft](http://i.imgur.com/6CfKOSW.jpg)
![Moontrains Lucid](http://i.imgur.com/cm1HMHD.jpg)

####How to install
Make sure you have GraphicsMagick or ImageMagick installed. If you are on OSX, you can simply do

`brew install imagemagick`

`brew install graphicsmagick`

Once installed, clone or extract this repository into a new directory and `npm install`. Once all the dependancies download you can start the application by launching the `node main.js` command.

####How to use
There are two texture packs in the **input** directory: *default* and the texture pack to convert. The default texture pack is used when the imported texture pack is missing a texture.

Go grab a texture pack for 1.8+ Minecraft. Try to grab the texture pack that is closest to 16x16 for best results. Larger texture packs will be downsized to 16x16. (Using 512x512 texture packs for example produces significantly worst results than using 64x64.) 

Simply extract the texture pack from the zip file and place that folder in **input**. input should only have two folders. Nothing else.

![Import Folder Example](https://puu.sh/sU7ki/0353adcd4d.png)

Run the command `node main.js` when you are ready and the *export* folder will be generated.

####How to insall on Vita
After running, your *export* folder will contain a list of files. All of the files and folders are to be merged with a specific directory on your **Hacked PSVita**. Be sure to merge them as we are not recreating all the files. In fact, do a backup as well. 

Merge the *contents* of export with `ux0:app/PCSE00491/Common/res/TitleUpdate/res/`. Do note, that your version of minecraft may differ from PCSE00491.

![example of merging files](https://puu.sh/sU7D7/1387e33de6.png)

####Todo
* Entities
* GUI
* item fixes
* colors.xml needs auto-configuration
* font support
* armor
* clocks & compasses
* advanced MipMap bluring for Vita AntiAliasing

####Issues
If you find any problems please let me know by raising a ticket. I have used Golden Apples, TNT and annoying purple '404' squares to illustrate a problem in in-game textures. This is a sign that it needs to be fixed.

The colors of certain things like Forests and some crops appear neon. This is due to colors.xml modifying the textures real-time. More work is needed to adjust colors.xml to be appropriate for each specific pack.

####Default Texture Pack
The default texture pack that is used to fill missing textures is [Lucid Texture Pack](https://www.snofox.net/lucid/) maintained by SnoFox and clueless222.