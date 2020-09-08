'use strict';

/**
 * Behavior
 */
export const Behavior = {
    CHASE: 103,
    HUNT: 104,
    DEAD: 106,
    SPAWN: 107,

    ATTACK: 201,
    RELOAD: 202,

    COLLECTED: 301,

    apply(entities) {
        for (let entity of entities) {
            if (entity.think) entity.think();
        }
    }
};
