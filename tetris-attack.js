
var tower_width = 6;
var tower_height = 12;
var main_tower = null;
var cursor = null;
var block_sprites = null;

/* constants
 */
const SCALE = 2;
const HANGTIME = 4;

/* States
 */
const STATIC = 0;
const HANG = 1
const FALL = 2
const SWAP = 3
const CLEAR = 4

var game = new Phaser.Game(16*SCALE*tower_width, 16*SCALE*tower_height, Phaser.AUTO, 'wrapper', { preload: preload, create: create, update: update});



function preload() {
    game.load.spritesheet('block0', 'sprites/block_blue.png', 16, 16, 6);
    game.load.spritesheet('block1', 'sprites/block_yellow.png', 16, 16, 6);
    game.load.spritesheet('block2', 'sprites/block_green.png', 16, 16, 6);
    game.load.spritesheet('cursor', 'sprites/cursor.png', 36, 20, 1);
    game.time.desiredFps = 20;
    block_sprites = ['block0', 'block1', 'block2'];
}
function init_tower(width, height) {
    var main_tower = new Array(width);
    for (var x=0; x<width; x++) {
        main_tower[x] = new Array(height);
        for (var y=0; y<height; y++) {
            main_tower[x][y] = null;
        }
    }
    return main_tower;
}
function random_blocks(tower) {
    /* adds random blocks to the tower */
    for (var y=0; y<3; y++) {
        for (var x=0; x<tower_width; x++) {
            tower[x][y] = create_block();
        }
    }
    return tower;
}
function update_blocks() {
    for (var x=0; x<tower_width; x++) {
        for (var y=0; y<tower_height; y++) {
            if (main_tower[x][y] != null) {
                update_block(x, y);
            }
        }
    }
}
function update_block(x, y) {
    if (main_tower[x][y].state == STATIC) {
        if (y!=0) {
            if (main_tower[x][y-1] == null) {
                main_tower[x][y].state = HANG;
                main_tower[x][y].hang_timer = HANGTIME;
            }
        }
    }
    else if (main_tower[x][y].state == HANG) {
        if (main_tower[x][y-1] == null &&
                main_tower[x][y].hang_timer == 0) {
            main_tower[x][y].state = FALL;
        }
        else {
            main_tower[x][y].hang_timer--;
        }
    }
    else if (main_tower[x][y].state == FALL) {
        if (y!=0 && main_tower[x][y-1]==null) {
            main_tower[x][y-1] = main_tower[x][y];
            main_tower[x][y] = null;
        }
        else {
            main_tower[x][y].state = STATIC;
        }
    }
}
function sync_sprites() {
    /* Sets the locations of the sprites to
     * the corresponding locations in the tower array */
    var height = tower_height*16*SCALE;
    for (var x=0; x<tower_width; x++) {
        for (var y=0; y<tower_height; y++) {
            if (main_tower[x][y] != null) {
                main_tower[x][y].x = 16*SCALE*x;
                main_tower[x][y].y = height - 16*SCALE* (y + 1);
            }
        }
    }
    cursor.x = (16*SCALE*cursor.grid.x) - (2 * SCALE);
    cursor.y = height - ((16*SCALE*(cursor.grid.y+1)) + (2 * SCALE));
}
function create_block() {
    /* create a random block from the available sprites */
    var rand = block_sprites[Math.floor(Math.random() * block_sprites.length)];
    block = game.add.sprite(0, 0, rand, 0);
    block.scale.setTo(SCALE, SCALE);
    block.state = STATIC;
    block.animations.add('land', [2, 3, 4], 10, true);
    return block;
}
function create_cursor() {
    var cursor = game.add.sprite(0, 0, 'cursor', 0);
    cursor.scale.setTo(SCALE, SCALE);
    cursor.grid = {};
    cursor.grid.x = 4;
    cursor.grid.y = 4;
    return cursor;
}
function move_left() {
    if (cursor.grid.x > 0)
        cursor.grid.x--;
}
function move_right() {
    if (cursor.grid.x < tower_width-2)
        cursor.grid.x++;
}
function move_up() {
    if (cursor.grid.y < tower_height-1)
        cursor.grid.y++;
}
function move_down() {
    if (cursor.grid.y > 0)
        cursor.grid.y--;
}
function move_switch() {
    console.log('switching');
    var block1 = main_tower[cursor.grid.x][cursor.grid.y]
    var block2 = main_tower[cursor.grid.x+1][cursor.grid.y]
    if (block1 == null && block2 == null) {
        return;
    }
    else if (block1 != null && block2 == null) {
        if (block1.state == FALL || block1.state == STATIC) {
            block1.state = SWAP;
            main_tower[cursor.grid.x+1][cursor.grid.y] = block1;
            main_tower[cursor.grid.x][cursor.grid.y] = null;
        }
    }
    else if (block1 == null && block2 != null) {
        if (block2.state == FALL || block2.state == STATIC) {
            block2.state = SWAP;
            main_tower[cursor.grid.x][cursor.grid.y] = block2;
            main_tower[cursor.grid.x+1][cursor.grid.y] = null;
        }
    }
    else if (block1 != null && block2 != null) {
        if ((block2.state == FALL || block2.state == STATIC) &&
            (block1.state == FALL || block1.state == STATIC)) {
            block1.state = SWAP;
            block2.state = SWAP;
            main_tower[cursor.grid.x][cursor.grid.y] = block2;
            main_tower[cursor.grid.x+1][cursor.grid.y] = block1;
        }
    }
}
function create() {
    main_tower = init_tower(tower_width, tower_height);
    main_tower = random_blocks(main_tower);
    main_tower[4][9] = create_block();
    console.log(main_tower);

    cursor = create_cursor();
    cursor_controller = game.input.keyboard.createCursorKeys();
    cursor_controller.space = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    cursor_controller.left.onDown.add(move_left);
    cursor_controller.right.onDown.add(move_right);
    cursor_controller.up.onDown.add(move_up);
    cursor_controller.down.onDown.add(move_down);
    cursor_controller.space.onDown.add(move_switch);
}
function update() {
    update_blocks();
    sync_sprites();
}
