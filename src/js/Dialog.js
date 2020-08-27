'use strict';

import { game } from './Game';
import { Sprite } from './Assets';
import { Geometry as G } from './Geometry';
import { Text } from './Text';
import { Input } from './input/Input';
import { Constants as C } from './Constants';

export class Dialog {
    constructor(key) {
        Object.assign(this, Dialog.details[key]);
        this.modal = this.speech;
        if (this.speech) {
            this.blockMove = this.blockFire = this.blockReload = true;
        }
        this.t = 0;
        this.d = this.speech ? 100 : 40;
        this.z = 98;
        game.dialog = this;
    }

    think() {
        if (this.t < this.d) this.t++;
        game.dialogSeen[this.flag] = true;

        if (this.flag === C.DIALOG_HINT_1) {
            if (game.input.direction.m > 0) {
                this.cull = true;
                game.dialog = false;
            }
        } else if (this.flag === C.DIALOG_HINT_3) {
            if (game.input.pressed[Input.Action.RELOAD]) {
                this.cull = true;
                game.dialog = false;
            }
        } else {
            if (game.input.pressed[Input.Action.ATTACK]) {
                if (this.t < this.d) {
                    this.t = this.d;
                } else {
                    this.cull = true;
                    game.dialog = false;
                }
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

Dialog.details = {
    [C.DIALOG_START_A]: {
        text: 'NOT AGAIN! THE PAGES OF THE SHOTGUN SPELLBOOK HAVE BEEN TORN OUT AND SCATTERED ALL OVER THIS DUNGEON!',
        flag: C.DIALOG_START_A,
        speech: true,
    },
    [C.DIALOG_START_B]: {
        text: 'FIND MY MISSING PAGES AND HELP ME REGAIN MY POWERS.',
        flag: C.DIALOG_START_B,
        required: C.DIALOG_START_A,
        speech: true
    },
    [C.DIALOG_HINT_1]: {
        text: 'PRESS wasd TO MOVE',
        flag: C.DIALOG_HINT_1,
        required: C.DIALOG_START_B,
        blockFire: true,
        blockReload: true
    },
    [C.DIALOG_HINT_2]: {
        text: 'PRESS l TO FIRE YOUR SHOTGUN',
        flag: C.DIALOG_HINT_2,
        required: C.DIALOG_HINT_1,
        blockReload: true
    },
    [C.DIALOG_HINT_3]: {
        text: 'PRESS r TO RELOAD',
        flag: C.DIALOG_HINT_3,
        required: C.DIALOG_HINT_2,
        blockFire: true
    },
};
