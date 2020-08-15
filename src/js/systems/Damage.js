'use strict';

import { Behavior } from './Behavior';

/**
 * Damage
 */
export const Damage = {
  apply(entities) {
    for (let entity of entities) {
      if (typeof entity.hp === 'number') {
        if (entity.damage) {
          entity.hp -= entity.damage;
          entity.damage = 0;
        }

        if (entity.hp <= 0) entity.state = Behavior.DEAD;
      }
    }
  }
};
