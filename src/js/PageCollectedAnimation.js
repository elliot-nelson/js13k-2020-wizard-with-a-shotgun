'use strict';

import { game } from './Game';
import { Sprite } from './Sprite';
import { Geometry as G } from './Geometry';
import { Audio } from './Audio';
import { viewport } from './Viewport';
import { Constants as C } from './Constants';
import { Hud } from './Hud';

export class PageCollectedAnimation {
  constructor(pos) {
    this.t = -1;
    this.d = 40;
    this.z = 101;

    this.a = Sprite.viewportSprite2uv(viewport, Sprite.page, pos, game.camera.pos);
    this.a.u -= Sprite.page.anchor.x;
    this.a.v -= Sprite.page.anchor.y;
    this.b = { u: viewport.width - C.HUD_PAGE_U, v: C.HUD_PAGE_V };
  }

  think() {
    if (++this.t === this.d) {
      this.cull = true;
      game.player.pages++;
      Hud.animatePageGlow();
    }
  }

  draw(viewport) {
    let uv = {
      u: (this.b.u - this.a.u) * this.t / this.d + this.a.u,
      v: (this.b.v - this.a.v) * this.t / this.d + this.a.v
    };

    viewport.ctx.drawImage(Sprite.page.img, uv.u, uv.v);
  }
}
