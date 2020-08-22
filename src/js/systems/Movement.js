'use strict';

import { game } from '../Game';
import { Geometry as G } from '../Geometry';
import { Constants as C } from '../Constants';

/**
 * Movement
 */
export const Movement = {
  apply(entities) {
    // Movement only applies to active entities with positions and velocities
    let movers = entities.filter(entity => entity.pos && entity.vel && !entity.cull);

    // Very basic "rounds" of collision resolution, since we have no real physics.
    // (As usual, "detecting" a collision is not the hard part... we need to resolve
    // them too!)
    for (let rounds = 0; rounds < 5; rounds++) {
      // Each pair of entities only needs to interact once.
      for (let i = 0; i < movers.length - 1; i++) {
        for (let j = i + 1; j < movers.length; j++) {
          this.clipVelocityEntityVsEntity(movers[i], movers[j]);
        }
      }

      for (let entity of movers) {
        this.clipVelocityAgainstWalls(entity);
      }
    }

    // Now we apply all movement, even if it's not going to be perfect.
    for (let entity of movers) {
      entity.pos.x += entity.vel.x;
      entity.pos.y += entity.vel.y;
    }
  },

  clipVelocityEntityVsEntity(entity, other) {
    let hit = G.intersectCircleCircle2(
      entity.pos, entity.radius, entity.vel,
      other.pos, other.radius, other.vel
    );
    if (hit) {
      if (entity.bounce && other.bounce) {
        entity.vel.x = -hit.nx * hit.m;
        entity.vel.y = -hit.ny * hit.m;
        other.vel.x = hit.nx * hit.m;
        other.vel.y = hit.ny * hit.m;
      } else {
        // Not a bug: we "add" the mass of the opposing entity to our own velocity when deciding who
        // is at fault for the collision. Entity velocities adjust in relation to their fault level.
        let entityM = G.normalizeVector(entity.vel).m + other.mass;
        let otherM = G.normalizeVector(other.vel).m + entity.mass;
        let entityI = entity.bounce ? 0.1 : 1;
        let otherI = other.bounce ? 0.1 : 1;
        entity.vel.x -= hit.nx * hit.m * entityI * entityM / (entityM + otherM);
        entity.vel.y -= hit.ny * hit.m * entityI * entityM / (entityM + otherM);
        other.vel.x += hit.nx * hit.m * otherI * otherM / (entityM + otherM);
        other.vel.y += hit.ny * hit.m * otherI * otherM / (entityM + otherM);
      }
    }
  },

  clipVelocityAgainstWalls(entity) {
    for (let tile of G.tilesHitByCircle(entity.pos, entity.vel, entity.radius)) {
      if (!G.tileIsPassable(tile.q, tile.r)) {
        let bounds = [G.qr2xy(tile), G.qr2xy({ q: tile.q + 1, r: tile.r + 1 })];
        let hit = G.intersectCircleRectangle(
          entity.pos,
          { x: entity.pos.x + entity.vel.x, y: entity.pos.y + entity.vel.y },
          entity.radius,
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
          if (entity.bounce) {
            if (hit.nx === 0) {
              entity.vel.y = -entity.vel.y;
            } else if (hit.ny === 0) {
              entity.vel.x = -entity.vel.x;
            } else {
              entity.vel.x += hit.nx;
              entity.vel.y += hit.ny;
            }
          } else {
            if (hit.nx === 0) {
              entity.vel.y = hit.y - entity.pos.y;
            } else if (hit.ny === 0) {
              entity.vel.x = hit.x - entity.pos.x;
            } else {
              entity.vel.x += hit.nx;
              entity.vel.y += hit.ny;
            }
          }
        }
      }
    }
  }
};
