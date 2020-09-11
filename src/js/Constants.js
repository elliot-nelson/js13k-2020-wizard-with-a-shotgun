'use strict';

/**
 * Constants and game settings, exported individually to maximize
 * rollup's tree shaking ability.
 */

export const TITLE = 'WIZARD WITH A SHOTGUN';

// Spritesheet URI (produced during gulp build)
export const SPRITESHEET_URI = 'sprites.png';

// The game's desired dimensions in pixels - the actual dimensions can be adjusted
// slightly by the Viewport module.
export const GAME_WIDTH  = 480;
export const GAME_HEIGHT = 270;

// Size in pixels of each map tile
export const TILE_SIZE   = 32;

// Bitmasks used to represent wall sides on map
export const WALL_TOP    = 0b0000_0001;
export const WALL_RIGHT  = 0b0000_0010;
export const WALL_BOTTOM = 0b0000_0100;
export const WALL_LEFT   = 0b0000_1000;

// Bitmasks used to represent "doorways" on map (these doorways are blocked
// during a brawl.)
export const OPEN_TOP    = 0b0001_0000;
export const OPEN_RIGHT  = 0b0010_0000;
export const OPEN_BOTTOM = 0b0100_0000;
export const OPEN_LEFT   = 0b1000_0000;

// Special room numbers - other room numbers >4 are "brawl rooms" where enemies
// spawn.
export const ROOM_SPAWN  = 1;
export const ROOM_TUNNEL = 2;
export const ROOM_ENDING = 25;

// Coordinates of the page count on the HUD (used by multiple modules since
// there is a little "page collected" animation).
export const HUD_PAGE_U  = 47;
export const HUD_PAGE_V  = 2;
export const HUD_PAGE_TEXT_U = 34;

// Handy IDs to represent the different dialog boxes / speech bubbles that can
// appear during the game.
export const DIALOG_START_A    = 0;
export const DIALOG_START_B    = 1;
export const DIALOG_HINT_1     = 2;
export const DIALOG_HINT_2     = 3;
export const DIALOG_HINT_3     = 4;
export const DIALOG_HINT_DEATH = 5;
export const DIALOG_HINT_E1    = 6;
export const DIALOG_HINT_E2    = 7;
export const DIALOG_HINT_DMG   = 8;

// Some pre-calculated radian values
export const R0          =   0;
export const R6          =   6 * Math.PI / 180;
export const R20         =  20 * Math.PI / 180;
export const R45         =  45 * Math.PI / 180;
export const R70         =  70 * Math.PI / 180;
export const R72         =  72 * Math.PI / 180;
export const R80         =  80 * Math.PI / 180;
export const R90         =  90 * Math.PI / 180;
export const R180        = 180 * Math.PI / 180;
export const R270        = 270 * Math.PI / 180;
export const R360        = 360 * Math.PI / 180;
