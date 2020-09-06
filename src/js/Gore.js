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
        this.vel = vector2point(angle2vector(this.angle, 5));
        this.a = (Math.PI * 45) / 180;
        this.noClipEntity = true;
        this.f = f;
        this.bounce = this.f > -1;
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

Gore.damage = entity => {
    let angle = vector2angle(entity.lastDamage.vector);

    for (let i = 0; i < 8; i++) {
        let r = Math.random() * entity.radius;
        let p = vectorAdd(entity.pos, angle2vector(Math.random() * R360, r));
        game.entities.push(
            new Gore(p, angle + Math.random() * R90 - R45, 0)
        );
    }
};

Gore.kill = entity => {
    console.log(entity.lastDamage);
    let angle = vector2angle(entity.lastDamage.vector);

    for (let i = 0; i < 16; i++) {
        let r = Math.random() * entity.radius;
        let p = vectorAdd(entity.pos, angle2vector(Math.random() * R360, r));
        game.entities.push(
            new Gore(
                p,
                angle + Math.random() * R90 - R45,
                (Math.random() * 4) | 0
            )
        );
    }
};
