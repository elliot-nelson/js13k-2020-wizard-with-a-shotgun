'use strict';

import { game } from './Game';
import { HUD_PAGE_U, HUD_PAGE_V, HUD_PAGE_TEXT_U, R90 } from './Constants';
import { clamp, vectorBetween, vectorAdd, vector2angle } from './Util';
import { Input } from './input/Input';
import { Sprite } from './Sprite';
import { Text } from './Text';
import { Viewport } from './Viewport';

/**
 * Hud
 *
 * Health bars, ammo, etc.
 */
export const Hud = {
    draw() {
        // Health
        let hp = clamp(game.player.hp, 0, 100);
        Viewport.ctx.drawImage(Sprite.hud_healthbar[0].img, 2, 2);
        Viewport.ctx.drawImage(
            Sprite.hud_healthbar[1].img,
            0,
            0,
            hp + 8,
            8,
            2,
            2,
            hp + 8,
            8
        );

        // Shells
        let sprite = Sprite.hud_shells_full;
        for (let i = 0; i < game.player.shellsMax; i++) {
            if (i + 1 > game.player.shellsLeft)
                sprite = Sprite.hud_shells_empty;
            Viewport.ctx.drawImage(sprite.img, 15 + 6 * i, 10);
        }

        // Pages
        if (game.player.pages > 0 || game.player.deaths > 0) {
            if (
                Hud.pageGlow &&
                game.frame >= Hud.pageGlow.start &&
                game.frame <= Hud.pageGlow.end
            ) {
                let glow =
                    ((game.frame - Hud.pageGlow.start) * 5) /
                    (Hud.pageGlow.end - Hud.pageGlow.start);
                Viewport.ctx.globalAlpha = 1 - glow / 10;
            } else {
                Viewport.ctx.globalAlpha = 0.5;
            }
            Viewport.ctx.drawImage(
                Sprite.page[1].img,
                Viewport.width - HUD_PAGE_U,
                HUD_PAGE_V
            );
            Viewport.ctx.globalAlpha = 1;
            Viewport.ctx.drawImage(
                Sprite.page[0].img,
                Viewport.width - HUD_PAGE_U,
                HUD_PAGE_V
            );
            Text.drawText(
                Viewport.ctx,
                'x' + ('' + game.player.pages).padStart(3, '0'),
                Viewport.width - HUD_PAGE_TEXT_U,
                4,
                2,
                Text.blue,
                Text.blue_shadow
            );
        }

        Hud.drawPageArrow();

        // Debugging - viewport width/height
        /*
        Text.drawRightText(
            Viewport.ctx,
            [Viewport.scale, Viewport.width, Viewport.height, 'stuvwx'].join(', '),
            Viewport.width - 4,
            Viewport.height - 18
        );
        */

        if (Input.pointer) {
            Viewport.ctx.save();
            Viewport.ctx.translate(Input.pointer.u, Input.pointer.v);
            Viewport.ctx.rotate(game.frame / 72);
            let crosshair = game.dialog
                ? Sprite.hud_crosshair_wait
                : Sprite.hud_crosshair;
            Viewport.ctx.drawImage(
                crosshair.img,
                -crosshair.anchor.x,
                -crosshair.anchor.y
            );
            Viewport.ctx.restore();
            //Sprite.drawSprite(ctx, Sprite.hud_crosshair, ptr.u, ptr.v, game.frame / 72);
        }
    },

    animatePageGlow() {
        Hud.pageGlow = { start: game.frame, end: game.frame + 30 };
    },

    drawPageArrow() {
        let page = Hud.closestPage();
        if (page) {
            let vector = vectorBetween(game.player.pos, page.pos);
            let angle = vector2angle(vector);
            vector.m = clamp(vector.m / 2, 16, Viewport.height / 2 - 5);
            if (vector.m > 32) {
                let xy = vectorAdd(game.player.pos, vector);
                let a = Math.sin(game.frame / 60)
                Viewport.ctx.globalAlpha = Math.sin(game.frame / 20) * 0.2 + 0.7;
                Sprite.drawViewportSprite(Sprite.page[2], xy, angle + R90);
                Viewport.ctx.globalAlpha = 1;
            }
        }
    },

    closestPage() {
        let pages = game.entities.filter(entity => entity.page);
        let pos = game.player.pos;
        pages.sort((a, b) => {
            let dist = ((a.pos.x - pos.x) ** 2 + (a.pos.y - pos.y) ** 2) - ((b.pos.x - pos.x) ** 2 + (b.pos.y - pos.y) ** 2);
            return dist;
        });
        return pages[0];
    }
};
