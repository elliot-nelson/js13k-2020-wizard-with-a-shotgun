'use strict';

import { Text } from './Text';
import { Viewport } from './Viewport';

export const Menu = {
    draw() {
        return;
        Viewport.ctx.fillStyle = '#393994';
        Viewport.ctx.fillRect(40, 40, 140, 80);

        let options = [
            { name: 'Abominable Snowman', cost: 500 },
            { name: 'Swords to Plowshares', cost: 600 },
            { name: 'Something', cost: 250 },
            { name: 'Plowshares', cost: 300 },
            { name: 'Will 1', cost: 400 },
            { name: 'Will 1', cost: 240 },
            { name: 'Elpegant', cost: 300 }
        ];

        for (let idx = 0; idx < options.length; idx++) {
            let option = options[idx];
            Text.drawText(
                Viewport.ctx,
                option.name,
                43,
                40 + 2 + idx * 9,
                Text.shadow
            );
            Text.drawText(Viewport.ctx, option.name, 42, 40 + 2 + idx * 9);

            Text.drawRightText(
                Viewport.ctx,
                String(option.cost),
                180 - 1,
                40 + 2 + idx * 9,
                Text.shadow
            );
            Text.drawRightText(
                Viewport.ctx,
                String(option.cost),
                180 - 2,
                40 + 2 + idx * 9
            );
        }

        /*
        Text.drawText(ctx, "Abominable Snowman", 120, 50);
        Text.drawText(ctx, "Abominable Snowman", 121, 50, Text.shadow);
        Text.drawRightText(ctx, "500", 120, 70);
        Text.drawRightText(ctx, "1,200", 120, 80);
        Text.drawRightText(ctx, "5,000", 120, 90);
        Text.drawRightText(ctx, "5,000", 121, 91, Text.shadow);


        5px 7px 9px

        draw(viewport) {
            Sprite.drawViewportSprite(Sprite.player, this.pos);

            Viewport.ctx.strokeStyle = 'rgba(255, 255, 64, 0.3)';
            Viewport.ctx.beginPath();*/
    }
};
