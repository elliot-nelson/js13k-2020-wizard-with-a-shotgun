'use strict';

import { game } from './Game';
import { Sprite } from './Sprite';
import { Geometry as G } from './Geometry';
import { Audio } from './Audio';
import { viewport } from './Viewport';

export class PageCollectedAnimation {
  constructor(pos) {
    this.t = -1;
    this.d = 20;
    this.z = 101;

    this.a = Sprite.viewportSprite2uv(viewport, Sprite.page, pos, game.camera.pos);
    this.b = { u: 300, v: 5 };
  }

  think() {
    if (++this.t === this.d) {
      this.cull = true;
      game.player.pages++;
    }
  }

  draw(viewport) {
    let uv = {
      u: (this.b.u - this.a.u) * this.t / this.d + this.a.u,
      v: (this.b.v - this.a.v) * this.t / this.d + this.a.v
    };

    viewport.ctx.drawImage(Sprite.page.img, uv.u - Sprite.page.anchor.x, uv.v - Sprite.page.anchor.y);
  }
}
