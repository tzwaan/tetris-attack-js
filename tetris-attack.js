/* Phaser functions */
function preload() {
    loadSprites(BLOCKS, CURSORS);
    GLOBAL.game.time.desiredFps = 60;
}

function create() {
    var game = new TaGame();
    // make sure the cursor is always on top:
    // GLOBAL.block_layer = GLOBAL.game.add.group();
    // GLOBAL.cursor_layer = GLOBAL.game.add.group();

    game.newGame(6, 12, GLOBAL.nrBlockSprites);
    console.log(game);


    GLOBAL.taGame_list[0] = game;
    MainLoop.setSimulationTimestep(1000/UPS);
    MainLoop.setBegin(begin).setUpdate(update).setDraw(render).start();
}
function update() {
    for (var i=0; i < GLOBAL.taGame_list.length; i++) {
        game = GLOBAL.taGame_list[i];

        game.tick();
    }
}

function begin() {
}

create();
