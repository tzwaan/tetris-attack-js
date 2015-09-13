/* The Block object */
/* States */
const STATIC = 0;
const HANG = 1
const FALL = 2
const SWAP = 3
const CLEAR = 4

/* Timing */
const HANGTIME = 6;
const FALLTIME = 4;
const SWAPTIME = 4;
const CLEARTIME = 12;

function Block() {
    this.x = null;
    this.y = null;
    this.state = null;
    this.above = null;
    this.under = null;
    this.left = null;
    this.right = null;
    this.counter = null;
    this.chain = null;
    this.is_cursor = null;
    this.sprite = null;

    /* Informational functions */
    this.isSwappable = function() {
    }

    this.isEmpty = function() {
        return this.counter == 0
            && this.sprite == null;
    }

    this.isSupport = function() {
        return this.state != FALL;
    }

    this.isClearable = function() {
        return this.isSwappable()
            && this.under != null
            && this.under.isSupport()
            && this.sprite != null;
    }

    this.isComboable = function() {
        return this.isClearable()
            || (this.state == CLEAR
                && this.counter == CLEARTIME)
    }

    /* Active functions */
    this.init = function(x, y) {
        this.x = x;
        this.y = y;
        this.state = STATIC;
    }

    this.newBlock = function(sprite_nr) {
        if (sprite_nr === undefined) {
            sprite_nr = Math.floor(Math.random() * GLOBAL.nrBlockSprites)
        }
        /* Check if there is no other sprite, otherwise it will stay onscreen*/
        if (this.sprite) {
            this.erase();
        }
        this.sprite = GLOBAL.game.add.sprite(0, 0, 'block'+rand, 0);
        this.sprite.scale.setTo(SCALE, SCALE);
    }

    this.clear = function() {
        if (this.state == CLEAR)
            return false;

        this.counter = CLEARTIME;
        this.state = CLEAR;
        this.chain = true;
        return true;
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
                break;
            case HANG:
            case FALL:
                break;
            case CLEAR:
                break;
            default:
                console.log("Unknown block state!");
        }
    }

    this.erase = function() {
        this.sprite.destroy();
        this.sprite = null;
        this.state = STATIC;
        this.counter = 0;
        this.chain = false;
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
    this.swap = null;
    this.command = null;

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
                blocks[x][y].init();

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
        this.swap = null; // not done
        this.command = null; // not done
    }

    this.updateNeighbors = function() {
        var block;
        for (var x = 0; x<this.width; x++) {
            for (var y = 0; y<this.height; y++) {
                block = this.blocks[x][y];

                if (x > 0) {
                    block.left = this.blocks[x-1][y];
                } else {
                    block.left = null;
                }

                if (x < this.width-1) {
                    block.right = this.blocks[x+1][y];
                } else {
                    block.right = null;
                }

                if (y > 0) {
                    block.under = this.blocks[x][y-1];
                } else {
                    block.under = null;
                }

                if (y < this.height-1) {
                    block.above = this.blocks[x][y+1];
                } else {
                    block.above = null;
                }
            }
        }
    }

    this.updateState = function() {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                this.blocks[x][y].updateState();
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
        var temp;

        temp = this.blocks[x][y];
        this.blocks[x][y] = this.blocks[x+1][y];
        this.blocks[x+1][y] = temp;
    }

    this.tick = function() {
        this.updateNeighbors();
        this.updateState();
        var combo = this.updateCombo();

        // TODO this is incorrect at the moment
        if (combo > 0) {
            this.chain++;
        } else {
            this.chain = 1;
        }
        // spawn garbage
    }
}


/* The Cursor object */
function Cursor() {
    this.x = null;
    this.y = null;
    this.left = null;
    this.right = null;

    this.sprite = null;
    this.game = null;
    this.controller = null;

    this.init = function(game) {
        this.game = game;
        this.x = Math.floor(game.width / 2);
        this.y = Math.floor(game.height / 3);

        this.left = game.blocks[this.x][this.y];
        this.right = game.blocks[this.x+1][this.y];

        this.sprite = game.add.sprite(0, 0, 'cursor', 0);
        this.sprite.scale.setT0(SCALE, SCALE);

        this.controller = game.input.keyboard.createCursorKeys();
    }

    this.mv_left = function() {
        if (this.x > 0)
            this.x--;
    }

    this.mv_right = function() {
        if (this.x < this.game.width-2)
            this.x++;
    }

    this.mv_down = function() {
        if (this.y > 0) {
            this.y--;
        }
    }

    this.mv_up = function() {
        if (this.y < this.game.height-1) {
            this.y++;
        }
    }

    this.mv_swap = function() {
        this.game.swap(this.x, this.y);
    }
}
