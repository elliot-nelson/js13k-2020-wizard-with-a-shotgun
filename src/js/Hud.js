'use strict';

import { game } from './Game';
import { Sprite } from './Sprite';
import { Text } from './Text';
import { viewport } from './Viewport';
import { Geometry as G } from './Geometry';
import { Constants as C } from './Constants';

export const Hud = {
    draw(viewport) {
        // Health
        let hp = G.clamp(game.player.hp, 0, 100);
        viewport.ctx.drawImage(Sprite.hud_health_frame.img, 2, 2);
        viewport.ctx.drawImage(Sprite.hud_health_fill.img, 0, 0, hp + 8, 8, 2, 2, hp + 8, 8);

        // Shells
        let sprite = Sprite.hud_shells_full;
        for (let i = 0; i < game.player.shellsMax; i++) {
            if (i + 1 > game.player.shellsLeft) sprite = Sprite.hud_shells_empty;
            viewport.ctx.drawImage(sprite.img, 15 + 6 * i, 10);
        }

        // Pages
        if (Hud.pageGlow && game.frame >= Hud.pageGlow.start && game.frame <= Hud.pageGlow.end) {
            let glow = (game.frame - Hud.pageGlow.start) * 5 / (Hud.pageGlow.end - Hud.pageGlow.start);
            viewport.ctx.globalAlpha = 1 - glow / 10;
        } else {
            viewport.ctx.globalAlpha = 0.5;
        }
        viewport.ctx.drawImage(Sprite.page_glow.img, viewport.width - C.HUD_PAGE_U, C.HUD_PAGE_V);
        viewport.ctx.globalAlpha = 1;
        viewport.ctx.drawImage(Sprite.page.img, viewport.width - C.HUD_PAGE_U, C.HUD_PAGE_V);
        Text.drawText(viewport.ctx, 'x' + ('' + game.player.pages).padStart(3, '0'), viewport.width - C.HUD_PAGE_TEXT_U, 4, 2, Text.default, Text.shadow);

        Text.drawText(viewport.ctx, String(this.frame), viewport.width - 30, viewport.height - 28);

        Text.drawRightText(viewport.ctx, [viewport.scale, viewport.width, viewport.height].join(', '), viewport.width - 4, viewport.height - 18);
        let ptr = game.input.pointer;
        if (ptr) {
            viewport.ctx.save();
            viewport.ctx.translate(ptr.u, ptr.v);
            viewport.ctx.rotate(this.frame / 72);
            let crosshair = game.dialog ? Sprite.hud_crosshair_wait : Sprite.hud_crosshair;
            viewport.ctx.drawImage(crosshair.img, -crosshair.anchor.x, -crosshair.anchor.y);
            viewport.ctx.restore();
            //Sprite.drawSprite(ctx, Sprite.hud_crosshair, ptr.u, ptr.v);
        }
    },

    animatePageGlow() {
      Hud.pageGlow = { start: game.frame, end: game.frame + 30 };
    }
};
