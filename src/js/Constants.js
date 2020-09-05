'use strict';

/**
 * Constants and game settings, exported individually to maximize
 * rollup's tree shaking ability.
 */

// Spritesheet URI (produced during gulp build)
export const SPRITESHEET_URI = 'sprites.png';

// The game's desired dimensions in pixels - the actual dimensions can be adjusted
// slightly by the Viewport module.
export const GAME_WIDTH  = 480;
export const GAME_HEIGHT = 270;

// Size in pixels of each map tile
export const TILE_WIDTH  = 32;
export const TILE_HEIGHT = 32;

// Tile numbers, for reference
export const TILE_WALL   = 0;
export const TILE_FLOOR1 = 1;
export const TILE_FLOOR2 = 2;

// Bitmasks used to represent wall sides on map
export const WALL_TOP    = 0b0000_1000;
export const WALL_RIGHT  = 0b0000_0100;
export const WALL_BOTTOM = 0b0000_0010;
export const WALL_LEFT   = 0b0000_0001;

// Bitmasks used to represent "doorways" on map (these doorways are blocked
// during a brawl.)
export const OPEN_TOP    = 0b1000_0000;
export const OPEN_RIGHT  = 0b0100_0000;
export const OPEN_BOTTOM = 0b0010_0000;
export const OPEN_LEFT   = 0b0001_0000;

// Coordinates of the page count on the HUD (used by multiple modules since
// there is a little "page collected" animation).
export const HUD_PAGE_U  = 47;
export const HUD_PAGE_V  = 2;
export const HUD_PAGE_TEXT_U = 34;

// Handy IDs to represent the different dialog boxes / speech bubbles that can
// appear during the game.
export const DIALOG_START_A = 1;
export const DIALOG_START_B = 2;
export const DIALOG_HINT_1  = 3;
export const DIALOG_HINT_2  = 4;
export const DIALOG_HINT_3  = 5;

// Some pre-calculated radian values
export const R0          = 0;
export const R20         = Math.PI * 20  / 180;
export const R45         = Math.PI * 45  / 180;
export const R70         = Math.PI * 70  / 180;
export const R72         = Math.PI * 72  / 180;
export const R80         = Math.PI * 80  / 180;
export const R90         = Math.PI * 90  / 180;
export const R180        = Math.PI * 180 / 180;
export const R270        = Math.PI * 270 / 180;
export const R360        = Math.PI * 360 / 180;
