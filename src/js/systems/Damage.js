'use strict';

import { Behavior } from './Behavior';
import { vectorAdd } from '../Util';
import { Player } from '../Player';
import { HealthChunkAnimation } from '../HealthChunkAnimation';
import { game } from '../Game';
import { Gore } from '../Gore';

/**
 * Damage
 */
export const Damage = {
    apply(entities) {
        for (let entity of entities) {
            if (typeof entity.hp === 'number') {
                if (entity.damage.length > 0) {
                    for (let damage of entity.damage) {
                        if (entity === game.player) {
                            game.entities.push(
                                new HealthChunkAnimation(
                                    entity.hp,
                                    damage.amount
                                )
                            );
                        }
                        entity.hp -= damage.amount;
                        damage.vector.m = damage.knockback;
                        entity.vel = vectorAdd(entity.vel, damage.vector);
                        entity.lastDamage = damage;
                        Gore.damage(entity);
                    }
                    entity.damage = [];
                }
                if (entity.hp <= 0) entity.state = Behavior.DEAD;
            }
        }
    }
};
