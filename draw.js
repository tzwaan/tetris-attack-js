var canvas = document.getElementById('tetris-canvas');
canvas.height = 16*(GAME_HEIGHT+1)*SCALE;
canvas.width = 16*GAME_WIDTH*SCALE;
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
ctx.scale(SCALE,SCALE);
ctx.fillStyle = '#000';
ctx.fillRect(0,0, 16*GAME_WIDTH, 16*(GAME_HEIGHT+1));

/*
var test_image = new Image();
test_image.src = "sprites/block_grooveshark.png";
test_image.addEventListener('load', function() {
    for (var i=0; i<6; i++)
        ctx.drawImage(test_image, 0, 0, 16, 16, i*16, 0, 16, 16);
}, false);
*/


function loadSprites(blocks, cursors) {
    var i;
    for (i=1; i<=blocks.names.length; i++) {
        blocks.sprites[i] = new Image();
        blocks.sprites[i].src = 'sprites/' + blocks.names[i-1] + '.png';
    }
    GLOBAL.nrBlockSprites = blocks.names.length;

    for (i=1; i<=cursors.names.length; i++) {

        cursors.sprites[i] = new Image();
        cursors.sprites[i].src = 'sprites/' + cursors.names[i-1] + '.png';
    }
    GLOBAL.nrCursorSprites = cursors.names.length;
}

function draw() {
    GLOBAL.taGame_list.forEach(drawGame);
}

function drawGame(game, loc) {
    game.blocks.forEach(function(blocks){
        blocks.forEach(drawBlock);
    });
}

function drawBlock(block) {
    if (block.sprite)
        ctx.drawImage(BLOCKS.sprites[block.sprite], 0, 0, 16, 16, block.x*16, block.game.height*16 - (block.y+1)*16, 16, 16);
}


loadSprites(BLOCKS, CURSORS);
