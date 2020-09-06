'use strict';

import { game } from './Game';
import { Sprite } from './Sprite';
import {
    tileIsPassable,
    angle2vector,
    vectorBetween,
    vector2angle,
    arcOverlap,
    vectorAdd,
    tilesHitBy,
    xy2uv
} from './Util';
import { R80 } from './Constants';
import { Viewport } from './Viewport';
import { Player } from './Player';
import { ScreenShake } from './ScreenShake';

export class ShotgunBlast {
    constructor(pos, angle) {
        this.pos = { ...pos };
        this.angle = angle;
        this.spread = R80;
        this.t = -1;
        this.d = 6;
        this.range = 55;

        game.screenshakes.push(new ScreenShake(6, 6, 6)); // so metal
    }

    think() {
        if (++this.t === this.d) this.cull = true;

        if (this.t === 3) {
            let entities = game.entities.filter(
                entity => entity.hp && entity !== game.player
            );
            for (let entity of entities) {
                let vect = vectorBetween(this.pos, entity.pos);
                if (vect.m >= this.range + entity.radius) continue;

                let dot1 = vectorBetween(this.pos, {
                    x: entity.pos.x - vect.y * entity.radius,
                    y: entity.pos.y + vect.x * entity.radius
                });
                let dot2 = vectorBetween(this.pos, {
                    x: entity.pos.x + vect.y * entity.radius,
                    y: entity.pos.y - vect.x * entity.radius
                });
                let sides = [vector2angle(dot1), vector2angle(dot2)];
                let overlap = arcOverlap(
                    sides[0],
                    sides[1],
                    this.angle - this.spread / 2,
                    this.angle + this.spread / 2
                );
                if (!overlap) continue;

                let wallHit = [];
                let k = vectorAdd(this.pos, angle2vector(sides[0], vect.m));
                for (let tile of tilesHitBy(
                    this.pos,
                    angle2vector(sides[0], vect.m)
                )) {
                    if (!tileIsPassable(tile.q, tile.r)) {
                        wallHit.push(tile);
                        break;
                    }
                }
                for (let tile of tilesHitBy(
                    this.pos,
                    angle2vector(sides[1], vect.m)
                )) {
                    if (!tileIsPassable(tile.q, tile.r)) {
                        wallHit.push(tile);
                        break;
                    }
                }

                if (wallHit.length < 2) {
                    // hit
                    entity.damage.push({
                        amount: 100,
                        vector: vect,
                        knockback: 9
                    });
                }
            }
        }
    }

    draw() {
    }
}
