'use strict';

import { game } from '../Game';
import { Geometry as G } from '../Geometry';
import { Constants as C } from '../Constants';

/**
 * Movement
 */
export const Movement = {
  apply(entities) {
    for (let entity of entities) {
      // Movement only applies to active entities with positions and velocities
      if (!entity.pos || !entity.vel || entity.cull) continue;

      Movement.clipVelocityAgainstWalls(entity);

      entity.pos.x += entity.vel.x;
      entity.pos.y += entity.vel.y;
    }
  },

  clipVelocityAgainstWalls(entity) {
    for (let rounds = 0; rounds < 5; rounds++) {
      let collided = false;
      for (let tile of G.tilesHitByCircle(entity.pos, entity.vel, C.PLAYER_BOUND_RADIUS)) {
        if (!G.tileIsPassable(tile.q, tile.r)) {
          let bounds = [G.qr2xy(tile), G.qr2xy({ q: tile.q + 1, r: tile.r + 1 })];
          let hit = G.intersectCircleRectangle(
            entity.pos,
            { x: entity.pos.x + entity.vel.x, y: entity.pos.y + entity.vel.y },
            C.PLAYER_BOUND_RADIUS,
            bounds
          );

          // The "math" part of detecting collision with walls is buried in the geometry functions
          // above, but it's not the whole story -- if we do detect a collision, we still need to
          // decide what to do about it.
          //
          // If the normal vector is horizontal or vertical, we zero out the portion of the vector
          // moving into the wall, allowing frictionless sliding (if we wanted to apply friction,
          // we could also reduce the other axis slightly).
          //
          // If the normal vector is not 90*, we "back up" off the wall by exactly the normal vector.
          // If the player runs into a corner at EXACTLY a 45 degree angle, they will simply "stick"
          // on it -- but one degree left or right and they'll slide around the corner onto the wall,
          // which is the desired result.
          if (hit) {
            if (hit.nx === 0) {
              entity.vel.y = hit.y - entity.pos.y;
            } else if (hit.ny === 0) {
              entity.vel.x = hit.x - entity.pos.x;
            } else {
              entity.vel.x += hit.nx;
              entity.vel.y += hit.ny;
            }
            collided = true;
          }
        }
      }
      if (!collided) break;
    }
  }
};
