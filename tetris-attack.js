GLOBAL.game = new Phaser.Game(16*GAME_WIDTH,
                           16*GAME_HEIGHT,
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
                'sprites/' + block_names[i] + '.png', 16, 16, 8);
    }
    GLOBAL.nrBlockSprites = i;

    for (var i=0; i<cursor_names.length; i++) {
        GLOBAL.game.load.spritesheet('cursor' + i,
                'sprites/' + cursor_names[i] + '.png', 38, 22, 2);
    }
    GLOBAL.nrCursorSprites = i;
}

/* PixelCanvas
 * makes sure pixelart stays pixelart and doesn't get blurry
 * on a larger canvas
 */
function pixelCanvas() {
    var width = 16*SCALE*GAME_WIDTH;
    var height = 16*SCALE*GAME_HEIGHT;
    var pixelCanvas = document.getElementById("pixel");
    pixelCanvas.width = width;
    pixelCanvas.height = height;

    PIXELCANVAS.pixelcontext = pixelCanvas.getContext("2d");
    PIXELCANVAS.pixelwidth = pixelCanvas.width;
    PIXELCANVAS.pixelheight = pixelCanvas.height;
    Phaser.Canvas.setSmoothingEnabled(PIXELCANVAS.pixelcontext, false);
}

/* Phaser functions */
function preload() {
    loadSprites(BLOCK_SPRITES, CURSOR_SPRITES);
    GLOBAL.game.time.desiredFps = 20;
}

function create() {
    pixelCanvas();

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
    for (var i=0; i < GLOBAL.taGame_list.length; i++) {
        game = GLOBAL.taGame_list[i];

        game.tick();

        game.render();
    }
}
