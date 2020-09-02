'use strict';

import { game } from './Game';
import { Monster } from './Monster';
import { Sprite } from './Sprite';
import { viewport } from './Viewport';
import { Player } from './Player';
import { Constants as C } from './Constants';

export class ShotgunParticle {
    constructor(pos, vector, m1, m2) {
        this.pos = pos;
        this.vector = vector;
        this.m1 = m1;
        this.m2 = m2;
        this.t = -1;
        this.d = 3;
    }

    think() {
        if (++this.t === this.d) this.cull = true;
    }

    draw(viewport) {
        let m = (this.m2 - this.m1) * (this.t / this.d) + this.m1;
        let x = this.pos.x + this.vector.x * this.vector.m * m;
        let y = this.pos.y + this.vector.y * this.vector.m * m;
        Sprite.drawViewportSprite(
            viewport,
            Sprite.shot_particle,
            { x, y },
            game.camera.pos,
            this.t + C.R90
        );
    }
}
