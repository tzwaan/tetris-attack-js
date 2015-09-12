var game = new Phaser.Game(800, 600, Phaser.AUTO, 'wrapper', { preload: preload, create: create, update: update});

var tower_width = 6;
var tower_height = 12;
var main_tower;
var block_sprites;


function preload() {
    game.load.spritesheet('block0', 'sprites/block_blue.png', 16, 16, 6);
    game.load.spritesheet('block1', 'sprites/block_yellow.png', 16, 16, 6);
    game.load.spritesheet('block2', 'sprites/block_green.png', 16, 16, 6);
    block_sprites = ['block0', 'block1', 'block2'];
}
function init_tower(width, height) {
    var main_tower = new Array(width);
    for (var i=0; i<width; i++) {
        main_tower[i] = new Array(height);
    }
    return main_tower;
}
function random_blocks(tower) {
    for (var j=0; j<3; j++) {
        for (var i=0; i<tower_width; i++) {
            tower[i][j] = create_block();
        }
    }
    return tower;
}
function sync_tower() {
    for (var x=0; x<tower_width; x++) {
        for (var y=0; y<tower_height; y++) {
            if (typeof main_tower[x][y] !== 'undefined') {
                main_tower[x][y].x = 16*4*x;
                main_tower[x][y].y = 16*4*y;
            }
        }
    }
}
function create_block() {
    var rand = block_sprites[Math.floor(Math.random() * block_sprites.length)];
    block = game.add.sprite(0, 0, rand, 0);
    block.scale.setTo(4, 4);
    block.animations.add('land', [2, 3, 4], 10, true);
    return block;
}
function create() {
    var block = create_block();
    main_tower = init_tower(tower_width, tower_height);
    main_tower = random_blocks(main_tower);
    console.log(main_tower);
}
function update() {
    sync_tower();
}
