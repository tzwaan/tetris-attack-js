/* The Block object */
/* States */
const STATIC = 0;
const HANG = 1
const FALL = 2
const SWAP = 3
const CLEAR = 4
/* Animation states */
const ANIM_SWAP_LEFT = 0;
const ANIM_SWAP_RIGHT = 1;
const ANIM_LAND = 2;
const ANIM_CLEAR = 4;

/* Timing */
const HANGTIME = 11;
const FALLTIME = 4;
const SWAPTIME = 4;
const CLEARBLINKTIME = 44;
const CLEARPAUSETIME = 23;
const CLEAREXPLODETIME = 9;
const PUSHTIME = 1000;
/* Animation timing */
const ANIM_SWAPTIME = 4;
const ANIM_LANDTIME = 0;
const ANIM_CLEARBLINKTIME = 15;
const ANIM_DANGERTIME = 6;

/* The block object.
 * Represents a block in the grid. An empty spot in the grid (visually) is
 * still represented by a block. This way each block can always ask its
 * neighbors for information.
 */
function Block() {
    this.game = null;
    this.x = null;
    this.y = null;
    this.state = null;
    this.above = null;
    this.under = null;
    this.left = null;
    this.right = null;
    this.counter = 0;
    this.animation_state = null;
    this.animation_counter = 0;
    this.chain = null;
    this.sprite = null;

    /* Initialise this block.
     *
     * game is the TaGame object this block belongs to.
     * x and y are its coordinates in the grid
     */
    this.init = function(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.state = STATIC;
        this.chain = false;
    }

    /* Initialise this block as a wall.
     * A wall block will see itself as its neighbors.
     * It is never supposed to have a sprite and should always have a state
     * of STATIC.
     * The wall is used on the outer edges of the grid.
     *
     * game is the TaGame object this block belongs to.
     */
    this.initWall = function(game) {
        this.game = game;
        this.x = null;
        this.y = null;
        this.under = this;
        this.above = this;
        this.left = this;
        this.right = this;
        this.state = STATIC;
        this.counter = 0;
        this.animation_state = null;
        this.animation_counter = 0;
        this.sprite = null;
    }

    /* Whether this block can be swapped or not.
     * Blocks can be swapped as long as no counter is running.
     * Blocks cannot be swapped underneath a block about to fall from hang
     *
     * returns a boolean
     */
    this.isSwappable = function() {
        if (this.above.state == HANG)
            return false;
        return this.counter == 0;
    }

    /* Whether this block is empty or not.
     * returns a boolean
     */
    this.isEmpty = function() {
        return this.counter == 0
            && this.sprite == null
            && this != this.game.wall;
    }

    /* Whether this block will stop other blocks from falling.
     * returns a boolean
     */
    this.isSupport = function() {
        return this.state != FALL
            && (this.sprite != null
                    || this.game.wall == this);
    }

    /* Whether this block can currently be cleared. It should not be busy and
     * should be supported.
     * returns a boolean
     */
    this.isClearable = function() {
        return this.isSwappable()
            && this.under.isSupport()
            && this.sprite != null;
    }

    /* Whether this block can currently participate in a combo. It should be
     * clearable or already been cleared during this state update.
     * returns a boolean
     */
    this.isComboable = function() {
        return this.isClearable()
            || (this.state == CLEAR
                && this.counter == CLEARBLINKTIME)
    }

    /* Make this block a new block.
     * Adds a sprite to the block, and animations to the sprite. Will
     * overwrite any sprite already present.
     *
     * optional sprite_nr is an int indicating which sprite should be used.
     * If none is specified, a random sprite will be picked.
     */
    this.newBlock = function(sprite_nr) {
        if (sprite_nr === undefined) {
            // No block number given, so generate random block
            sprite_nr = Math.floor(Math.random() * GLOBAL.nrBlockSprites)
        }
        /* Check if there is no other sprite, otherwise it will stay onscreen*/
        if (this.sprite) {
            this.erase();
        }
        this.sprite = GLOBAL.game.add.sprite(0, 0, 'block'+sprite_nr, 0);
        this.sprite.animations.add('land', [4, 2, 3, 0]);
        this.sprite.animations.add('clear', [6, 0, 6, 0, 6, 0, 6, 0, 6, 0, 6, 0, 6, 0, 5]);
        this.sprite.animations.add('live', [0]);
        this.sprite.animations.add('dead', [1]);
        this.sprite.animations.add('danger', [0, 4, 0, 3, 2, 3]);
        this.sprite.animations.add('face', [5]);
        GLOBAL.block_layer.add(this.sprite);
    }

    /* Update the current state of this block based on its own state, and the
     * states of its neighbors.
     * Will keep its current state it its counter is still running.
     * Block behaviour should be described in the wiki
     */
    this.updateState = function() {
        /* If the block has a counter, decrement it, return if it is not done*/
        if (this.counter > 0) {
            this.counter--;
            if (this.counter > 0)
                return;
        }

        /* Run through the state switch to determine behaviour */
        switch (this.state) {
            case STATIC:
            case SWAP:
                if (!this.sprite) {
                    this.state = STATIC;
                    this.chain = false;
                    return;
                }
                else if (this.under == this.game.wall) {
                    this.state = STATIC;
                    this.chain = false;
                }
                else if (this.under.state == HANG) {
                    this.state = HANG;
                    this.counter = this.under.counter;
                    this.chain = this.under.chain;
                }
                else if (this.under.isEmpty()) {
                    this.state = HANG;
                    this.counter = HANGTIME;
                }
                else {
                    this.chain = false;
                }
                break;
            case HANG:
                this.state = FALL;
            case FALL:
                if (this.under.isEmpty()) {
                    this.fall();
                }
                else if (this.under.state == CLEAR) {
                    this.state = STATIC;
                }
                else {
                    this.state = this.under.state;
                    this.counter = this.under.counter;
                    if (this.under.chain) {
                        this.chain = true;
                    }
                }
                if ((this.state == STATIC || this.state == SWAP) && this.sprite) {
                    this.sprite.animations.play('land', GLOBAL.game.time.desiredFps, false);
                }
                break;
            case CLEAR:
                this.erase();
                break;
            default:
                console.log("Unknown block state!");
        }
    }

    /* Set the block sprite to the correct rendering location,
     * keeping animations and offsets in mind.
     * optional nextLine boolean determines if the block should be in the grid
     * or in the bottom line still being added.
     */
    this.render = function(nextLine) {
        if (!nextLine) {
            if (this.sprite) {
                this.sprite.x = this.x*16;
                this.sprite.y = this.game.height*16 - (this.y+1)*16;

                if (this.animation_counter <= 0)
                    this.animation_state = null;
                if (this.animation_counter > 0) {
                    this.animation_counter--;
                }
                switch (this.animation_state) {
                    case ANIM_SWAP_LEFT:
                        var step = 16/ANIM_SWAPTIME;
                        this.sprite.x += step * this.animation_counter;
                        break;
                    case ANIM_SWAP_RIGHT:
                        var step = 16/ANIM_SWAPTIME;
                        this.sprite.x -= step * this.animation_counter;
                        break;
                    case ANIM_CLEAR:
                    case ANIM_LAND:
                        break;
                    default:
                }
            }
        }
        else {
            if (this.sprite) {
                this.sprite.x = this.x*16;
                this.sprite.y = this.game.height*16;
            }
        }
    }

    /* This block will give its state and sprite to the block under it and then
     * reset to an empty block.
     */
    this.fall = function() {
        this.under.state = this.state;
        this.under.counter = this.counter;
        this.under.sprite = this.sprite;
        this.under.chain = this.chain;

        this.state = STATIC;
        this.counter = 0;
        this.sprite = null;
        this.chain = false;
    }

    /* Swap this block with its right neighbour.
     */
    this.swap = function() {
        var temp_sprite = this.right.sprite;

        this.right.sprite = this.sprite;
        this.right.chain = false;

        this.sprite = temp_sprite;
        this.chain = false;

        if (this.sprite == null) {
            this.state = SWAP;
            this.counter = 0;
        }
        else {
            this.state = SWAP;
            this.counter = SWAPTIME;
            this.animation_state = ANIM_SWAP_LEFT;
            this.animation_counter = ANIM_SWAPTIME;
        }

        if (this.right.sprite == null) {
            this.right.state = SWAP;
            this.right.counter = 0;
        }
        else {
            this.right.state = SWAP;
            this.right.counter = SWAPTIME;
            this.right.animation_state = ANIM_SWAP_RIGHT;
            this.right.animation_counter = ANIM_SWAPTIME;
        }
    }

    /* Erase the contents of this block and start a chain in
     * its upper neighbour.
     */
    this.erase = function() {
        if (this.sprite)
            this.sprite.destroy();
        this.sprite = null;
        this.state = STATIC;
        this.counter = 0;
        this.chain = false;
        if (this.above.sprite)
            this.above.chain = true;
    }

    /* Sets this blocks state to CLEAR.
     *
     * returns [combo, chain] where
     * combo is an int represeting the nr of blocks that are set to clear.
     * chain is a boolean telling if this block is part of a chain.
     */
    this.clear = function() {
        if (this.state == CLEAR)
            return [0, this.chain];

        this.counter = CLEARBLINKTIME;
        this.state = CLEAR;

        this.sprite.animations.play('clear', GLOBAL.game.time.desiredFps, false);
        return [1, this.chain];
    }

    /* Combos and Chains the current block with its neighbours.
     *
     * returns [combo, chain] where
     * combo is an int represeting the nr of blocks participating in the combo.
     * chain is a boolean telling if this combo is part of a chain.
     */
    this.cnc = function() {
        var combo = 0;
        var chain = false;

        if (!this.isComboable()) {
            return [combo, chain];
        }

        if (this.left.isComboable() && this.right.isComboable()) {
            if (this.left.sprite.key == this.sprite.key
                    && this.right.sprite.key == this.sprite.key) {
                var middle = this.clear();
                var left = this.left.clear();
                var right = this.right.clear();
                combo += middle[0];
                combo += left[0];
                combo += right[0];

                if (middle[1] || left[1] || right[1]) {
                    chain = true;
                }
            }
        }

        if (this.above.isComboable() && this.under.isComboable()) {
            if (this.above.sprite.key == this.sprite.key
                    && this.under.sprite.key == this.sprite.key) {
                var middle = this.clear();
                var above = this.above.clear();
                var under = this.under.clear();
                combo += middle[0];
                combo += above[0];
                combo += under[0];

                if (middle[1] || above[1] || under[1]) {
                    chain = true;
                }
            }
        }

        return [combo, chain];
    }
}


/* The Tetris Attack Game object */

function TaGame() {
    this.width = null;
    this.height = null;
    this.nr_blocks = null;
    this.blocks = null;
    this.nextLine = null;
    this.combo = null;
    this.chain = null;
    this.config = null;
    this.command = null;
    this.cursor = null;
    this.wall = null;
    this.score = 0;
    this.scoreText = null;
    this.pushTime = 0;
    this.pushCounter = 0;

    /* Initialize new game with a viewport of x * y and given amount of
     * different blocks */
    this.newGame = function(width, height, nr_blocks) {
        this.width = width;
        this.height = height;
        this.nr_blocks = nr_blocks;
        this.blocks = this.newBlocks(width, height);
        this.fillBlocks(this.blocks, 6, 4);
        this.nextLine = this.newBlocks(6, 1);
        this.fillBlocks(this.nextLine, 6, 1);
        this.command = null; // not done
        this.cursor = new Cursor();
        this.cursor.init(this);
        this.chain = 0;
        this.pushTime = PUSHTIME;
        this.pushCounter = this.pushTime;

        this.score = 0;
        this.scoreText = GLOBAL.game.add.text(0, 0, '0', { fontSize: '10px', fill: '#fff'});
        this.scoreText.setTextBounds(50, 0, 46, 32);
        this.scoreText.boundsAlignH = 'right';
        this.scoreText.align = 'right';
        this.scoreText.lineSpacing = -7;

        this.wall = new Block();
        this.wall.initWall(this);

        this.updateNeighbors();
        this.render();
    }

    /* Create a new blocks array and fill it with the old shifted 1 up */
    this.push = function() {
        if (this.isDanger(1)) {
            this.gameOver();
            return 0;
        }
        var blocks = this.newBlocks(this.width, this.height);
        for (var x=0; x<this.width; x++) {
            for (var y=0; y<this.height-1; y++) {
                blocks[x][y+1] = this.blocks[x][y];
            }
            this.blocks[x][this.height-1].erase();
            blocks[x][0] = this.nextLine[x][0];
            blocks[x][0].sprite.animations.play('live');
        }
        this.blocks = blocks;
        this.nextLine = this.newBlocks(6, 1);
        this.fillBlocks(this.nextLine, 6, 1);
        for (var x=0; x<this.width; x++) {
            this.nextLine[x][0].sprite.animations.play('dead');
        }
        if (this.cursor.y < this.height-1)
            this.cursor.y++;

        return 1;
    }

    this.gameOver = function() {
        for (var x=0; x<this.width; x++) {
            for (var y=0; y<this.height; y++) {
                if (this.blocks[x][y].sprite)
                    this.blocks[x][y].sprite.animations.play('face');
                this.tick = function() {
                    console.log("game over bitch");
                }
            }
            this.nextLine[x][0].sprite.animations.play('face');
        }
        this.pushCounter = 0;
    }

    /* Create a new array of blocks with one extra for spawning blocks */
    this.newBlocks = function(width, height) {
        var blocks = new Array(width);
        for (var x=0; x<width; x++) {
            blocks[x] = new Array(height);
            for (var y=0; y<height; y++) {
                blocks[x][y] = new Block();
                blocks[x][y].init(this, x, y);
            }
        }
        return blocks;
    }

    this.fillBlocks = function(blocks, width, height) {
        for (var x=0; x<width; x++) {
            for (var y=0; y<height; y++) {
                blocks[x][y].newBlock();
            }
        }
    }

    this.updateNeighbors = function() {
        var block;
        for (var x = 0; x<this.width; x++) {
            for (var y = 0; y<this.height; y++) {
                block = this.blocks[x][y];

                if (x > 0) {
                    block.left = this.blocks[x-1][y];
                } else {
                    block.left = this.wall;
                }

                if (x < this.width-1) {
                    block.right = this.blocks[x+1][y];
                } else {
                    block.right = this.wall;
                }

                if (y > 0) {
                    block.under = this.blocks[x][y-1];
                } else {
                    block.under = this.wall;
                }

                if (y < this.height-1) {
                    block.above = this.blocks[x][y+1];
                } else {
                    block.above = this.wall;
                }
            }
        }
    }

    this.updateState = function() {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                this.blocks[x][y].updateState();
                this.blocks[x][y].x = x;
                this.blocks[x][y].y = y;
            }
        }
    }

    this.updateCnc = function() {
        var combo = 0;
        var chain = false;

        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                cnc = this.blocks[x][y].cnc();
                combo += cnc[0];
                if (cnc[1]) {
                    chain = true;
                }
            }
        }
        return [combo, chain];
    }

    this.swap = function(x, y) {
        if (!this.blocks[x][y].isSwappable()
            || !this.blocks[x+1][y].isSwappable())
            return;
        this.blocks[x][y].swap();
    }

    this.chainOver = function() {
        var chain = true;
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                if (this.blocks[x][y].chain) {
                    chain = false;
                }
            }
        }
        return chain;
    }

    this.comboToScore = function(combo) {
        switch(combo) {
            case 4:
                return 20;
            case 5:
                return 30;
            case 6:
                return 50;
            case 7:
                return 60;
            case 8:
                return 70;
            case 9:
                return 80;
            case 10:
                return 100;
            case 11:
                return 140;
            case 12:
                return 170;
            default:
                return 0;
        }
    }

    this.chainToScore = function(chain) {
        switch(chain) {
            case 2:
                return 50;
            case 3:
                return 80;
            case 4:
                return 150;
            case 5:
                return 300;
            case 6:
                return 400;
            case 7:
                return 500;
            case 8:
                return 700;
            case 9:
                return 900;
            case 10:
                return 1100;
            case 11:
                return 1300;
            case 12:
                return 1500;
            case 13:
                return 1800;
            default:
                return 0;
        }
    }

    this.isDanger = function(height) {
        for (var x=0; x<this.width; x++) {
            for (var y=this.height-1; y>(this.height-1)-height; y--) {
                if (this.blocks[x][y].sprite) {
                    return true;
                }
            }
        }
        return false;
    }

    this.tick = function() {
        if (this.cursor.controller.push.isDown)
            this.pushCounter -= 100;
        else
            this.pushCounter--;
        if (this.pushCounter <= 0) {
            this.pushCounter = this.pushTime;
            this.score += this.push();
        }
        this.updateNeighbors();
        this.updateState();
        // combo n chain
        var cnc = this.updateCnc();
        if (this.chain) {
            if (this.chainOver()) {
                console.log("chain over");
                this.chain = 0;
            }
        }

        /* Calculate the current score */
        if (cnc[0] > 0) {
            console.log("combo is ", cnc);
            this.score += (cnc[0] * 10)
            this.score += this.comboToScore(cnc[0]);
            if (cnc[1]) {
                this.chain++;
                console.log("chain is ", this.chain + 1);
            }
            if (this.chain) {
                this.score += this.chainToScore(this.chain + 1);
            }
            console.log("Score: ", this.score);
        }
        // spawn garbage


        this.render();
    }

    this.render = function() {
        for (var x=0; x<this.width; x++) {
            for (var y=0; y<this.height; y++) {
                this.blocks[x][y].render();
            }
        }
        for (var x=0; x<this.width; x++) {
            this.nextLine[x][0].render(true)
        }
        this.cursor.sprite.x = this.cursor.x*16 - 3;
        this.cursor.sprite.y = this.height*16 - (this.cursor.y+1)*16 - 3;

        var text = "" + this.score;
        if (this.chain) {
            text += "\nchain: " + (this.chain + 1);
        }

        this.scoreText.text = text;

        GLOBAL.block_layer.y = (this.pushCounter/this.pushTime) * 16;
        GLOBAL.cursor_layer.y = (this.pushCounter/this.pushTime) * 16;

        PIXELCANVAS.pixelcontext.drawImage(GLOBAL.game.canvas, 0, 0, GAME_WIDTH*16, (GAME_HEIGHT+1)*16, 0, 0, PIXELCANVAS.pixelwidth, PIXELCANVAS.pixelheight);
    }
}


/* The Cursor object */
function Cursor() {
    this.mySelf = this;
    this.x = null;
    this.y = null;
    this.left = null;
    this.right = null;

    this.sprite = null;
    this.game = null;
    this.controller = null;

    this.init = function(game) {
        this.game = game;
        // center the cursor
        this.x = Math.floor(game.width / 2) - 1;
        this.y = Math.floor(game.height / 3);

        this.left = game.blocks[this.x][this.y];
        this.right = game.blocks[this.x+1][this.y];

        this.sprite = GLOBAL.game.add.sprite(0, 0, 'cursor0', 0);
        this.sprite.animations.add('idle', [0, 1]);
        this.sprite.animations.play('idle', Math.round(GLOBAL.game.time.desiredFps/10), true);
        GLOBAL.cursor_layer.add(this.sprite);

        this.controller = GLOBAL.game.input.keyboard.createCursorKeys();
        this.controller.swap = GLOBAL.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.controller.push = GLOBAL.game.input.keyboard.addKey(Phaser.Keyboard.C);

        this.controller.left.onDown.add(this.mv_left, this);
        this.controller.right.onDown.add(this.mv_right, this);
        this.controller.down.onDown.add(this.mv_down, this);
        this.controller.up.onDown.add(this.mv_up, this);
        this.controller.swap.onDown.add(this.mv_swap, this);
    }

    this.mv_left = function() {
        if (this.x > 0)
            this.x--;
    }

    this.mv_right = function(cursor) {
        if (this.x < this.game.width-2)
            this.x++;
    }

    this.mv_down = function(cursor) {
        if (this.y > 0) {
            this.y--;
        }
    }

    this.mv_up = function(cursor) {
        if (this.y < this.game.height-1) {
            this.y++;
        }
    }

    this.mv_swap = function() {
        this.game.swap(this.x, this.y);
    }
}
