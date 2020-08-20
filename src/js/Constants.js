'use strict';

export const Constants = {
    R0: 0,
    R90: Math.PI * 0.5,
    R180: Math.PI,
    R270: Math.PI * 1.5,
    R360: Math.PI * 2,

    // Size in pixels of tiles in the game maze
    TILE_WIDTH: 32,
    TILE_HEIGHT: 32,

    // Tile constants
    TILE_FLOOR1:            0,
    TILE_FLOOR2:            1,
    TILE_WALL1:             2,
    TILE_WALL2:             3,

    // Wall bits, for rendering wall edges
    WALL_TOP:      0b1000,
    WALL_RIGHT:    0b0100,
    WALL_BOTTOM:   0b0010,
    WALL_LEFT:     0b0001,

    PLAYER_BOUND_RADIUS: 9
};
