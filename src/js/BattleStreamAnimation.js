'use strict';

import { game } from './Game';
import { Sprite } from './Assets';
import { Geometry as G } from './Geometry';

export class BattleStreamAnimation {
  constructor(pos) {
    this.t = -1;
    this.d = 16;
    this.z = -5;
    this.pos = pos;
  }

  think() {
    if (++this.t === this.d) this.cull = true;
  }

  draw(viewport) {
    if (this.t >= 0 && this.t < 16) {
      let f = Math.floor(this.t / 2);
      Sprite.drawViewportSprite(viewport, Sprite.battle_stream[f], { x: this.pos.x, y: this.pos.y + f / 2 }, game.camera.pos);
    }
  }
}
