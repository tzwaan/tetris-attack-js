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
    var x = null;
    var y = null;
    var state = null;
    var above = null;
    var under = null;
    var left = null;
    var right = null;
    var counter = null;
    var chain = null;
    var is_cursor = null;
    var sprite = null;

    /* Informational functions */
    var isSwappable = function() {
    }

    var isEmpty = function() {
        return this.counter == 0
            && this.sprite == null;
    }

    var isSupport = function() {
        return this.state != FALL;
    }

    var isClearable = function() {
        return this.isSwappable()
            && this.under != null
            && this.under.isSupport()
            && this.sprite != null;
    }

    var isComboable = function() {
        return this.isClearable()
            || (this.state == CLEAR
                && this.counter == CLEARTIME)
    }

    /* Active functions */
    var init = function(x, y) {
        this.x = x;
        this.y = y;
        this.state = STATIC;

        var nr = Math.floor(Math.random() * GLOBAL.nrBlockSprites)
        this.sprite = GLOBAL.game.add.sprite(0, 0, 'block'+rand, 0);
        this.sprite.scale.setTo(SCALE, SCALE);
    }

    var clear = function() {
        if (this.state == CLEAR)
            return false;

        this.counter = CLEARTIME;
        this.state = CLEAR;
        this.chain = true;
        return true;
    }

    var updateState = function() {
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

    var erase = function() {
        this.sprite.destroy();
        this.sprite = null;
        this.state = STATIC;
        this.counter = 0;
        this.chain = false;
    }
}


/* The Tetris Attack Game object */

function TaGame() {
    var width = null;
    var height = null;
    var nr_blocks = null;
    var combo = null;
    var chain = null;
    var blocks = null;
    var config = null;
    var swap = null;
    var command = null;

    /* Create a new blocks array and fill it with the old shifted 1 up */
    var push = function(height) {
        var blocks = this.newBlocks(this.width, height);
        for (var i=0; i<this.width; i++) {
            for (var j=0; j<this.height; j++) {
                /* unfinsihed */
            }
        }
    }

    /* Create a new array of blocks with one extra for spawning blocks */
    var newBlocks = function(width, height) {
        var blocks = new Array(width);
        for (var x=0; x<width; x++) {
            blocks[x] = new Array(height);
            for (var y=0; y<height; y++) {
                blocks[x][y] = new Block();
                blocks[x][y].init();
            }
        }
        return blocks;
    }

    /* Initialize new game with a viewport of x * y and given amount of
     * different blocks */
    var newGame = function(width, height, nr_blocks) {
        this.width = width;
        this.height = height;
        this.nr_blocks = nr_blocks;
        this.blocks = this.newBlocks(width, height);
        this.swap = null; // not done
        this.command = null; // not done
    }

    var updateNeighbors = function() {
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

    var updateState = function() {
        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                this.blocks[x][y].updateState();
            }
        }
    }

    var updateCombo = function() {
        var combo = 0;

        for (var x = 0; x < this.width; x++) {
            for (var y = 0; y < this.height; y++) {
                combo += this.blocks[x][y].combo();
            }
        }
        return combo;
    }

    var swap = function(x, y) {
        if (!this.blocks[x][y].isSwappable()
            || !this.blocks[x+1][y].isSwappable())
            return;
        var temp;

        temp = this.blocks[x][y];
        this.blocks[x][y] = this.blocks[x+1][y];
        this.blocks[x+1][y] = temp;
    }

    var tick = function() {
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
    var x = null;
    var y = null;
    var left = null;
    var right = null;

    var sprite = null;
    var game = null;
    var controller = null;

    var init = function(game) {
        this.game = game;
        this.x = Math.floor(game.width / 2);
        this.y = Math.floor(game.height / 3);

        this.left = game.blocks[this.x][this.y];
        this.right = game.blocks[this.x+1][this.y];

        this.sprite = game.add.sprite(0, 0, 'cursor', 0);
        this.sprite.scale.setT0(SCALE, SCALE);

        this.controller = game.input.keyboard.createCursorKeys();
    }

    var mv_left = function() {
        if (this.x > 0)
            this.x--;
    }

    var mv_right = function() {
        if (this.x < this.game.width-2)
            this.x++;
    }

    var mv_down = function() {
        if (this.y > 0) {
            this.y--;
        }
    }

    var mv_up = function() {
        if (this.y < this.game.height-1) {
            this.y++;
        }
    }

    var mv_swap = function() {
        this.game.swap(this.x, this.y);
    }
}
