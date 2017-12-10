var canvas = document.getElementById('tetris-canvas');
canvas.height = 16*(GAME_HEIGHT+1)*SCALE;
canvas.width = 16*GAME_WIDTH*SCALE;
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
ctx.scale(SCALE,SCALE);
ctx.fillStyle = '#000';
ctx.font = '12px arial';
ctx.fillRect(0,0, 16*GAME_WIDTH, 16*(GAME_HEIGHT+1));

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

function render() {
    GLOBAL.taGame_list.forEach(function(game) {
        game.render();
    });
}

loadSprites(BLOCKS, CURSORS);
