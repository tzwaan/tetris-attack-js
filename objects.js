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
const HANGTIME = 6;
const FALLTIME = 4;
const SWAPTIME = 0;
const CLEARTIME = 12;
/* Animation timing */
const ANIM_SWAPTIME = 4;
const ANIM_LANDTIME = 0;
const ANIM_CLEARTIME = 0;

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

    this.init = function(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.state = STATIC;
    }
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

    /* Informational functions */
    this.isSwappable = function() {
        if (this.above.state == HANG)
            return false;
        return this.counter == 0;
    }

    this.isEmpty = function() {
        return this.counter == 0
            && this.sprite == null
            && this != this.game.wall;
    }

    this.isSupport = function() {
        return this.state != FALL;
    }

    this.isClearable = function() {
        return this.isSwappable()
            && this.under.isSupport()
            && this.sprite != null;
    }

    this.isComboable = function() {
        return this.isClearable()
            || (this.state == CLEAR
                && this.counter == CLEARTIME)
    }

    /* Active functions */
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
        GLOBAL.block_layer.add(this.sprite);
    }

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
                    return;
                }
                else if (this.under == this.game.wall) {
                    this.state = STATIC;
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
     * keeping animations and offsets in mind
     * const ANIM_SWAP_LEFT = 0;
     * const ANIM_SWAP_RIGHT = 1;
     * const ANIM_LAND = 2;
     * const ANIM_CLEAR = 4;
     * const ANIM_SWAPTIME = 3;
     * const ANIM_LANDTIME = 0;
     * const ANIM_CLEARTIME = 0;
     */
    this.render = function() {
        if (this.sprite) {
            this.sprite.x = this.x*16;
            this.sprite.y = this.game.height*16 - (this.y+1)*16;

            if (this.animation_counter <= 0)
                return;
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
                default:
            }
        }
    }

    this.fall = function() {
        this.under.state = this.state;
        this.under.counter = this.counter;
        this.under.sprite = this.sprite;
        this.under.chain = this.chain;

        this.state = STATIC;
        this.counter = 0;
        this.sprite = null;
        this.chain = null;
    }

    this.swap = function() {
        var temp_sprite = this.right.sprite;
        var temp_chain = this.right.chain;

        this.right.sprite = this.sprite;
        this.right.chain = this.chain;

        this.sprite = temp_sprite;
        this.chain = temp_chain;

        if (this.sprite == null) {
            this.state = STATIC;
            this.counter = 0;
        }
        else {
            this.state = SWAP;
            this.counter = SWAPTIME;
            this.animation_state = ANIM_SWAP_LEFT;
            this.animation_counter = ANIM_SWAPTIME;
        }

        if (this.right.sprite == null) {
            this.right.state = STATIC;
            this.right.counter = 0;
        }
        else {
            this.right.state = SWAP;
            this.right.counter = SWAPTIME;
            this.right.animation_state = ANIM_SWAP_RIGHT;
            this.right.animation_counter = ANIM_SWAPTIME;
        }

    }

    this.erase = function() {
        this.sprite.destroy();
        this.sprite = null;
        this.state = STATIC;
        this.counter = 0;
        this.chain = false;
    }

    this.clear = function() {
        if (this.state == CLEAR)
            return 0;

        this.counter = CLEARTIME;
        this.state = CLEAR;
        this.chain = true;

        this.sprite.animations.play('clear', GLOBAL.game.time.desiredFps, false);
        return 1;
    }

    this.combo = function() {
        var combo = 0;

        if (!this.isComboable()) {
            return combo;
        }

        if (this.left.isComboable() && this.right.isComboable()) {
            if (this.left.sprite.key == this.sprite.key
                    && this.right.sprite.key == this.sprite.key) {
                combo += this.clear();
                combo += this.left.clear();
                combo += this.right.clear();
            }
        }

        if (this.above.isComboable() && this.under.isComboable()) {
            if (this.above.sprite.key == this.sprite.key
                    && this.under.sprite.key == this.sprite.key) {
                combo += this.clear();
                combo += this.above.clear();
                combo += this.under.clear();
            }
        }

        return combo;
    }
}


/* The Tetris Attack Game object */

function TaGame() {
    this.width = null;
    this.height = null;
    this.nr_blocks = null;
    this.combo = null;
    this.chain = null;
    this.blocks = null;
    this.config = null;
    this.command = null;
    this.cursor = null;
    this.wall = null;

    /* Create a new blocks array and fill it with the old shifted 1 up */
    this.push = function(height) {
        var blocks = this.newBlocks(this.width, height);
        for (var i=0; i<this.width; i++) {
            for (var j=0; j<this.height; j++) {
                /* unfinsihed */
            }
        }
    }

    /* Create a new array of blocks with one extra for spawning blocks */
    this.newBlocks = function(width, height) {
        var blocks = new Array(width);
        for (var x=0; x<width; x++) {
            blocks[x] = new Array(height);
            for (var y=0; y<height; y++) {
                blocks[x][y] = new Block();
                blocks[x][y].init(this, x, y);

                //temp testing code
                if (y<4) {
                    blocks[x][y].newBlock();
                }
            }
        }
        return blocks;
    }

    /* Initialize new game with a viewport of x * y and given amount of
     * different blocks */
    this.newGame = function(width, height, nr_blocks) {
        this.width = width;
        this.height = height;
        this.nr_blocks = nr_blocks;
        this.blocks = this.newBlocks(width, height);
        this.command = null; // not done
        this.cursor = new Cursor();
        this.cursor.init(this);

        this.wall = new Block();
        this.wall.initWall(this);

        this.updateNeighbors();
        this.render();
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

    this.updateCombo = function() {
        var combo = 0;

        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                combo += this.blocks[x][y].combo();
            }
        }
        return combo;
    }

    this.swap = function(x, y) {
        if (!this.blocks[x][y].isSwappable()
            || !this.blocks[x+1][y].isSwappable())
            return;
        this.blocks[x][y].swap();
    }

    this.tick = function() {
        this.updateNeighbors();
        this.updateState();
        var combo = this.updateCombo();

        /* TODO this is incorrect at the moment
        if (combo > 0) {
            this.chain++;
        } else {
            this.chain = 1;
        }
        */
        if (combo > 0) {
            console.log("combo is ", combo);
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
        this.cursor.sprite.x = this.cursor.x*16 - 3;
        this.cursor.sprite.y = this.height*16 - (this.cursor.y+1)*16 - 3;

        PIXELCANVAS.pixelcontext.drawImage(GLOBAL.game.canvas, 0, 0, GAME_WIDTH*16, GAME_HEIGHT*16, 0, 0, PIXELCANVAS.pixelwidth, PIXELCANVAS.pixelheight);
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
        this.controller.space = GLOBAL.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.controller.left.onDown.add(this.mv_left, this);
        this.controller.right.onDown.add(this.mv_right, this);
        this.controller.down.onDown.add(this.mv_down, this);
        this.controller.up.onDown.add(this.mv_up, this);
        this.controller.space.onDown.add(this.mv_swap, this);
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
