'use strict';

import { game } from './Game';
import { Monster } from './Monster';
import { Sprite } from './Sprite';
import { viewport } from './Viewport';
import { Player } from './Player';
import { Constants as C } from './Constants';
import { vector2angle, vector2point, angle2vector, vectorAdd } from './Util';

export class Gore {
    constructor(pos, angle, f) {
        this.pos = { ...pos };
        this.angle = angle;
        this.vel = vector2point(angle2vector(this.angle, 5));
        this.a = Math.PI * 25 / 180;
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
        this.vel.x *= 0.90;
        this.vel.y *= 0.90;
        this.a *= 0.95;
        this.r += this.a;
    }

    draw(viewport) {
        Sprite.drawViewportSprite(viewport, Sprite.gore[this.f], this.pos, game.camera.pos, this.r);
    }
}

Gore.damage = entity => {
    let angle = vector2angle(entity.lastDamage.vector);

    for (let i = 0; i < 4; i++) {
        let r = Math.random() * entity.radius;
        let p = vectorAdd(entity.pos, angle2vector(Math.random() * C.R360, r));
        game.entities.push(new Gore(p, angle + Math.random() * C.R90 - C.R45, 0));
    }
};

Gore.kill = entity => {
    let angle = vector2angle(entity.lastDamage.vector);

    for (let i = 0; i < 15; i++) {
        let r = Math.random() * entity.radius;
        let p = vectorAdd(entity.pos, angle2vector(Math.random() * C.R360, r));
        game.entities.push(new Gore(p, angle + Math.random() * C.R90 - C.R45, Math.random() * 4 | 0));
    }
};
