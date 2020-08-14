'use strict';

import { game } from './Game';
import { Geometry as G } from './Geometry';
import { Constants as C } from './Constants';

/**
 * Detection
 */
export const Detection = {
  lineOfSight(a, b) {
      // todo: this checks center mass
      for (let tile of G.tilesHitBetween(a.pos, b.pos)) {
        if (!G.tileIsPassable(tile.q, tile.r)) return false;
      }

      // todo: distance away
      // todo: facing check
      return true;
  }
};
