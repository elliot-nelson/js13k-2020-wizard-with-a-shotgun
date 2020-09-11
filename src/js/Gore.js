'use strict';

import { game } from './Game';
import { R45, R90, R360 } from './Constants';
import { vector2angle, vector2point, angle2vector, vectorAdd } from './Util';
import { Sprite } from './Sprite';
import { Viewport } from './Viewport';
import { Player } from './Player';

export class Gore {
    constructor(pos, angle, f) {
        this.pos = { ...pos };
        this.angle = angle;
        this.vel = vector2point(angle2vector(this.angle, f ? 8 : 5));
        this.a = R45;
        this.noClipEntity = true;
        this.f = f;
        this.bounce = true;
        this.radius = 1;
        this.r = 0;
        this.t = -1;
        this.d = this.f === 0 ? 45 : 70;
    }

    think() {
        if (++this.t === this.d) this.cull = true;
        this.vel.x *= 0.9;
        this.vel.y *= 0.9;
        this.a *= 0.95;
        this.r += this.a;
    }

    draw() {
        Sprite.drawViewportSprite(
            Sprite.gore[this.f],
            this.pos,
            this.r
        );
    }
}

Gore.damage = entity => Gore.spray(entity, 8, () => 0);
Gore.kill = entity => Gore.spray(entity, 16, () => (Math.random() * 4) | 0);
Gore.spray = (entity, count, cb) => {
    let angle = entity.lastDamage ? vector2angle(entity.lastDamage.vector) : Math.random() * R360;

    for (let i = 0; i < count * (game.victory ? 2 : 1); i++) {
        let r = Math.random() * entity.radius,
            p = vectorAdd(entity.pos, angle2vector(Math.random() * R360, r));
        game.entities.push(
            new Gore(p, angle + Math.random() * R90 - R45, cb())
        );
    }
};
