'use strict';

import { game } from './Game';
import { R72 } from './Constants';
import { xy2uv, vector2point, angle2vector } from './Util';
import { Sprite } from './Sprite';
import { Audio } from './Audio';
import { Viewport } from './Viewport';
import { Text } from './Text';

export class SpawnAnimation {
    constructor(pos) {
        this.pos = { ...pos };
        this.t = -1;
        this.d = 40;
        this.z = 101;
    }

    think() {
        if (++this.t === this.d) this.cull = true;
    }

    draw() {
        let chars = ['s', 't', 'u', 'v', 'w'];
        let uv = xy2uv(this.pos);

        Viewport.ctx.globalAlpha = 1 - (this.t / this.d);
        for (let i = 0; i < 5; i++) {
            let v = vector2point(angle2vector(R72 * i + this.t / 36, 12));
            Text.drawText(Viewport.ctx, chars[i], uv.u + v.x + Math.random() * 4 - 2, uv.v + v.y + Math.random() * 4 - 2, 1);
        }
        Viewport.ctx.globalAlpha = 1;
    }
}
