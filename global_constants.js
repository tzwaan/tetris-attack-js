/* The factor at which the game is scaled on your screen */
const SCALE = 3;
const GAME_WIDTH = 6;
const GAME_HEIGHT = 12;
const UPS = 60;
const BLOCKS = {
    names: [
        'block_blue',
        'block_yellow',
        'block_green',
        'block_purple',
        'block_red',
        'block_via',
    ],
    sprites: [
    ],
    animations: {
        land: [4, 4, 4, 2, 2, 2, 3, 3, 3, 0],
        clear: [6, 0],
        live: [0],
        dead: [1],
        danger: [0, 0, 0, 4, 4, 4, 0, 0, 0, 3, 3, 3, 2, 2, 2, 3, 3, 3],
        face: [5]
    }
};
const CURSORS = {
    names: [
        'cursor'
    ],
    sprites: [
    ],
    animations: {
        idle: [0, 1]
    }
}
const GLOBAL = {game: null,
                nrBlockSprites: 0,
                nrCursorSprites: 0,
                taGame_list: [
                ],
                block_layer: 0,
                cursor_layer: 0}
const PIXELCANVAS = {pixelcontent: null,
                     pixelwidth: 0,
                     pixelheight: 0}
