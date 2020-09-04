'use strict';

import { game } from './Game';
import { Sprite } from './Sprite';
import { Audio } from './Audio';
import { Viewport } from './Viewport';
import { HUD_PAGE_U, HUD_PAGE_V } from './Constants';
import { Hud } from './Hud';

export class PageCollectedAnimation {
    constructor(pos) {
        this.t = -1;
        this.d = 40;
        this.z = 101;

        this.a = Sprite.viewportSprite2uv(
            Sprite.page,
            pos
        );
        this.a.u -= Sprite.page.anchor.x;
        this.a.v -= Sprite.page.anchor.y;
        this.b = { u: Viewport.width - HUD_PAGE_U, v: HUD_PAGE_V };
    }

    think() {
        if (++this.t === this.d) {
            this.cull = true;
            game.player.pages++;
            Hud.animatePageGlow();
        }
    }

    draw() {
        let uv = {
            u: ((this.b.u - this.a.u) * this.t) / this.d + this.a.u,
            v: ((this.b.v - this.a.v) * this.t) / this.d + this.a.v
        };

        Viewport.ctx.drawImage(Sprite.page.img, uv.u, uv.v);
    }
}
