'use strict';

import { game } from './Game';
import { Sprite } from './Assets';
import { Geometry as G } from './Geometry';
import { Text } from './Text';

export class Dialog {
    constructor(text, flag) {
        this.text = text;
        this.flag = flag;
        this.t = 0;
        this.d = 2000;
        this.z = 101;
    }

    think() {
        if (++this.t === this.d) this.cull = true;
    }

    draw(viewport) {
        let length = Math.ceil(this.t / this.d * this.text.length);
        let uv = G.xy2uv(game.player.pos);
        uv.u += 6;
        uv.v += 6;

        viewport.ctx.drawImage(Sprite.dialog_speech.img, uv.u, uv.v);
        Text.drawParagraph(ctx,
            this.text.substring(0, length),
            uv.u + 12,
            uv.v + 5,
            110,
            50,
            1,
            Text.black, Text.black_shadow
        );
    }
}
