'use strict';

/**
 * Behavior
 */
export const Behavior = {
  IDLE:   101,
  WANDER: 102,
  CHASE:  103,
  HUNT:   104,
  FLEE:   105,
  DEAD:   106,

  apply(entities) {
    for (let entity of entities) {
      if (entity.think) entity.think();
    }
  }
};
