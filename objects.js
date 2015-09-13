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
}


/* The Tetris Attack Game object */

function TaGame() {
    var width;
    var height;
    var combo;
    var chain;
    var blocks;
    var config;
    var swap;
    var command;

    /* Create a new blocks array and fill it with the old shifted 1 up */
    var push = function(height) {
    }

    /* Create a new array of blocks with one extra for spawning blocks */
    var newBlocks = function(width, height) {
        var blocks = new Array(width);
        for (var i=0; i<width; i++) {
            blocks[i] = new Array(height);
        }
        return blocks;
    }
}
