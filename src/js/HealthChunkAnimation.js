'use strict';

import { game } from './Game';
import { Sprite } from './Assets';
import { Geometry as G } from './Geometry';

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

  draw(viewport) {
    let x = this.start - this.amount + 8;

    if (this.t > 15) viewport.ctx.globalAlpha = 1 - this.t * 0.1;
    viewport.ctx.drawImage(
      Sprite.hud_health_chunk.img,
      x, 3, this.amount, 3,
      x + 2, this.y, this.amount, 3
    );
    viewport.ctx.globalAlpha = 1;
  }
}
