'use strict';

import { game } from './Game';
import { Constants as C } from './Constants';
import { tilesHitBetween, tileIsPassable } from './Util';

/**
 * Detection
 */
export const Detection = {
    lineOfSight(a, b) {
        // todo: this checks center mass
        for (let tile of tilesHitBetween(a.pos, b.pos)) {
            if (tileIsPassable(tile.q, tile.r)) return false;
        }

        // todo: distance away
        // todo: facing check
        return true;
    }
};
