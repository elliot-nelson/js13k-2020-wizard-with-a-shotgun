'use strict';

import { Behavior } from './Behavior';
import { Geometry as G } from '../Geometry';

/**
 * Damage
 */
export const Damage = {
  apply(entities) {
    for (let entity of entities) {
      if (typeof entity.hp === 'number') {
        if (entity.damage.length > 0) {
          for (let damage of entity.damage) {
            entity.hp -= damage.amount;
            damage.vector.m = 10; // push back amount
            entity.vel = G.vectorAdd(entity.vel, damage.vector);
          }
          entity.damage = [];
        }
        if (entity.hp <= 0) entity.state = Behavior.DEAD;
      }
    }
  }
};
