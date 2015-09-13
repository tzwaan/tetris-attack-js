GLOBAL.game = new Phaser.Game(16*SCALE*GAME_WIDTH,
                           16*SCALE*GAME_HEIGHT,
                           Phaser.AUTO,
                           'wrapper',
                           {preload: preload,
                            create: create,
                            update: update});

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
    available_blocks = ['block0', 'block1', 'block2', 'block3'];
}
function create() {
    cursor_controller = GLOBAL.game.input.keyboard.createCursorKeys();
    cursor_controller.space = GLOBAL.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    var game = TaGame();
    console.log(game);
    game.newGame(6, 12, GLOBAL.nrBlockSprites);

    /*
    cursor_controller.left.onDown.add(move_left);
    cursor_controller.right.onDown.add(move_right);
    cursor_controller.up.onDown.add(move_up);
    cursor_controller.down.onDown.add(move_down);
    cursor_controller.space.onDown.add(move_switch);
    */
}
function update() {
}
