'use strict';

import { game } from './Game';
import { Sprite } from './Sprite';
import { Audio } from './Audio';

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
      let start = (end - 3) | 0;

      if (this.t === start) {
        Audio.playShellReload();
      }
      if (this.t >= start) {
        let y = Math.min(10, 10 + this.t - end);
        viewport.ctx.globalAlpha = Math.min(1, 1 + (this.t - end) / 10);
        viewport.ctx.drawImage(Sprite.hud_shells_full.img, 15 + 6 * i, y);
        viewport.ctx.globalAlpha = 1;
      }
    }
  }
}
