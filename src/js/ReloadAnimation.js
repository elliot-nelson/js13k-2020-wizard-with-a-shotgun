'use strict';

import { game } from './Game';
import { Sprite } from './Assets';
import { Geometry as G } from './Geometry';

export class ReloadAnimation {
  constructor(frames) {
    this.t = -1;
    this.d = frames;
    this.z = 101;
  }

  think() {
    if (++this.t === this.d) this.cull = true;
  }

  draw(viewport) {
    for (let i = 0; i < game.player.shellsMax; i++) {
      let end = i * this.d / game.player.shellsMax;
      let start = end - 3;

      if (this.t >= start) {
        let y = Math.min(10, 10 + this.t - end);
        viewport.ctx.drawImage(Sprite.hud_shells_full.img, 15 + 6 * i, y);
      }
    }
  }
}