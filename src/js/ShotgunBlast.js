'use strict';

import { game } from './Game';
import { Monster } from './Monster';
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
import { Constants as C } from './Constants';
import { viewport } from './Viewport';
import { Player } from './Player';
import { ScreenShake } from './ScreenShake';

export class ShotgunBlast {
    constructor(pos, angle) {
        this.pos = { ...pos };
        this.angle = angle;
        this.spread = C.R80;
        this.t = -1;
        this.d = 6;
        this.range = 55;

        game.screenshakes.push(new ScreenShake(6, 6, 6)); // wink
    }

    think() {
        if (++this.t === this.d) this.cull = true;

        if (this.t === 2) {
            for (let i = 0; i < 0; i++) {
                let angle =
                    Math.random() * this.spread - this.spread / 2 + this.angle;
                let vector = angle2vector(angle, this.range);
                game.entities.push(
                    new ShotgunParticle(
                        this.pos,
                        vector,
                        0.7 + Math.random() * 0.2,
                        0.9 + Math.random() * 0.1
                    )
                );
            }
        }

        if (this.t === 3) {
            let entities = game.entities.filter(
                entity => entity.hp && !(entity instanceof Player)
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

    draw(viewport) {
        // TODO
        //Sprite.drawViewportSprite(viewport, Sprite.monster, this.pos, game.camera.pos);
        /*
        let uv =xy2uv(this.pos);
    viewport.ctx.beginPath();
    viewport.ctx.arc(uv.u, uv.v, this.range, this.angle - this.spread / 2, this.angle + this.spread / 2);
    viewport.ctx.lineTo(uv.u, uv.v);
    viewport.ctx.closePath();
    viewport.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)'
    viewport.ctx.stroke();
    */
    }
}
