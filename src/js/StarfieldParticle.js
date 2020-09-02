'use strict';

import { game } from './Game';
import { Monster } from './Monster';
import { Sprite } from './Sprite';
import { angle2vector } from './Util';
import { viewport } from './Viewport';
import { Player } from './Player';
import { Constants as C } from './Constants';

export class StarfieldParticle {
    constructor() {
        this.uv = {
            u: viewport.width / 2,
            v: viewport.height / 2
        };
        let brightness = (Math.random() * 80) | 0;
        this.color =
            'rgba(' +
            (brightness + 85) +
            ',' +
            (80 - brightness) +
            ',' +
            (brightness + 85) +
            ',0.9)';
        this.angle = Math.random() * C.R360;
        this.vector = angle2vector(this.angle, 1 + brightness / 40);
        this.t = 0;
        this.d = 100;
        this.z = -1;
    }

    think() {
        if (++this.t === this.d) this.cull = true;

        this.uv.u += this.vector.x * this.vector.m;
        this.uv.v += this.vector.y * this.vector.m;
    }

    draw(viewport) {
        viewport.ctx.fillStyle = this.color;
        viewport.ctx.fillRect(this.uv.u, this.uv.v, 1, 1);
        viewport.ctx.drawImage(Sprite.glyphs[2].img, this.uv.u, this.uv.v);
    }
}
