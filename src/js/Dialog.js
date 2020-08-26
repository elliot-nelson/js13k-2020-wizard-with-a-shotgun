'use strict';

import { game } from './Game';
import { Sprite } from './Assets';
import { Geometry as G } from './Geometry';
import { Text } from './Text';
import { Input } from './input/Input';

export class Dialog {
    constructor(text, flag, speech) {
        this.text = text;
        this.flag = flag;
        this.speech = speech;
        this.t = 0;
        this.d = this.speech ? 100 : 40;
        this.z = 98;
        game.dialog = this;
    }

    think() {
        if (this.t < this.d) this.t++;

        if (game.input.pressed[Input.Action.ATTACK]) {
            if (this.t < this.d) {
                this.t = this.d;
            } else {
                this.cull = true;
                game.flags[this.flag] = true;
                game.dialog = false;
            }
        }
    }

    draw(viewport) {
        let length = Math.ceil(this.t / this.d * this.text.length);
        let substr = this.text.substring(0, length);
        let idx = this.text.indexOf(' ', length - 1);
        if (idx < 0) idx = this.text.length;
        if (idx-length > 0) substr += '#'.repeat(idx - length);

        if (this.speech) {
            let uv = { u: viewport.center.u + 6, v: viewport.center.v + 6 };
            viewport.ctx.drawImage(Sprite.dialog_speech.img, uv.u, uv.v);
            Text.drawParagraph(viewport.ctx,
                substr,
                uv.u + 12, uv.v + 5,
                110, 50,
                1,
                Text.black, Text.black_shadow
            );
        } else {
            let uv = {
                u: viewport.center.u - Sprite.dialog_hint.img.width / 2,
                v: viewport.height - Sprite.dialog_hint.img.height - 4
            };

            viewport.ctx.drawImage(Sprite.dialog_hint.img, uv.u, uv.v);
            Text.drawParagraph(viewport.ctx,
                substr,
                uv.u + 5, uv.v + 5,
                110, 50,
                1,
                Text.black, Text.black_shadow
            );
        }
    }
}
