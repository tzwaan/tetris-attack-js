GLOBAL.game = new Phaser.Game(16*SCALE*GAME_WIDTH,
                           16*SCALE*GAME_HEIGHT,
                           Phaser.CANVAS,
                           'phaser',
                           {preload: preload,
                            create: create,
                            update: update});
//GLOBAL.game.stage.smoothed = false;

function loadSprites(block_names, cursor_names) {
    var i;
    for (i=0; i<block_names.length; i++) {
        GLOBAL.game.load.spritesheet('block' + i,
                'sprites/' + block_names[i] + '.png', 16, 16, 6);
    }
    GLOBAL.nrBlockSprites = i;

    for (var i=0; i<cursor_names.length; i++) {
        GLOBAL.game.load.spritesheet('cursor' + i,
                'sprites/' + cursor_names[i] + '.png', 36, 20, 1);
    }
    GLOBAL.nrCursorSprites = i;
}

/* Change this to render() */
//function sync_sprites() {
//    /* Sets the locations of the sprites to
//     * the corresponding locations in the tower array */
//    var height = tower_height*16*SCALE;
//    for (var x=0; x<tower_width; x++) {
//        for (var y=0; y<tower_height; y++) {
//            if (main_tower[x][y] != null) {
//                main_tower[x][y].x = 16*SCALE*x;
//                main_tower[x][y].grid.x = x;
//                main_tower[x][y].y = height - 16*SCALE* (y + 1);
//                main_tower[x][y].grid.y = y;
//            }
//        }
//    }
//    cursor.x = (16*SCALE*cursor.grid.x) - (2 * SCALE);
//    cursor.y = height - ((16*SCALE*(cursor.grid.y+1)) + (2 * SCALE));
//}

/* Phaser functions */
function preload() {
    loadSprites(BLOCK_SPRITES, CURSOR_SPRITES);
    GLOBAL.game.time.desiredFps = 20;
}

// make sure pixels stay pixels
var pixelcontext = null;
var pixelwidth = 0;
var pixelheight = 0;
function create() {
    // make sure pixels stay pixels
    var pixelCanvas = document.getElementById("pixel");
    pixelcontext = pixelCanvas.getContext("2d");
    pixelwidth = pixelCanvas.width;
    pixelheight = pixelCanvas.height;
    Phaser.Canvas.setSmoothingEnabled(pixelcontext, false);

    var game = new TaGame();
    // make sure the cursor is always on top:
    GLOBAL.block_layer = GLOBAL.game.add.group();
    GLOBAL.cursor_layer = GLOBAL.game.add.group();

    game.newGame(6, 12, GLOBAL.nrBlockSprites);
    console.log(game);
    game.blocks[4][9].newBlock();
    game.blocks[4][8].newBlock();
    game.blocks[4][10].newBlock();


    GLOBAL.taGame_list[0] = game;
}
function update() {
    game = GLOBAL.taGame_list[0];

    game.tick();

    game.render();

    // make sure pixels stay pixels.
    pixelcontext.drawImage(GLOBAL.game.canvas, 0, 0, GAME_WIDTH*16*SCALE, GAME_HEIGHT*16*SCALE, 0, 0, pixelwidth, pixelheight);
}
