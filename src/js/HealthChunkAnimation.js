'use strict';

import { game } from './Game';
import { Sprite } from './Sprite';
import { Viewport } from './Viewport';

export class HealthChunkAnimation {
    constructor(start, amount) {
        this.start = start;
        this.amount = amount;
        this.t = -1;
        this.d = 20;
        this.z = 101;
        this.y = 5;
        this.vel = -0.7;
        this.gravity = 0.09;
    }

    think() {
        if (++this.t === this.d) this.cull = true;
        this.y += this.vel;
        this.vel += this.gravity;
    }

    draw() {
        let x = this.start - this.amount + 8;

        if (this.t > 15) Viewport.ctx.globalAlpha = 1 - this.t * 0.1;
        Viewport.ctx.drawImage(
            Sprite.hud_health_chunk.img,
            x,
            3,
            this.amount,
            3,
            x + 2,
            this.y,
            this.amount,
            3
        );
        Viewport.ctx.globalAlpha = 1;
    }
}
