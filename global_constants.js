/* The factor at which the game is scaled on your screen */
const SCALE = 3;
const GAME_WIDTH = 6;
const GAME_HEIGHT = 12;
const BLOCK_SPRITES = [
    'block_blue',
    'block_yellow',
    'block_green',
    'block_purple',
    'block_red',
    'block_via',
]
const CURSOR_SPRITES = [
    'cursor'
]
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
