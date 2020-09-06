'use strict';

import { game } from './Game';
import { Sprite } from './Sprite';
import { Text } from './Text';
import { Input } from './input/Input';
import { Viewport } from './Viewport';
import { DIALOG_START_A, DIALOG_START_B, DIALOG_HINT_1, DIALOG_HINT_2, DIALOG_HINT_3, DIALOG_HINT_DEATH } from './Constants';

export class Dialog {
    constructor(key) {
        Object.assign(this, Dialog.details[key]);
        this.modal = this.speech;
        if (this.speech) {
            this.blockMove = this.blockFire = this.blockReload = true;
        }
        this.t = 0;
        this.d = this.speech ? 100 : 40;
        this.z = 102;
        game.dialog = this;
    }

    think() {
        if (this.t < this.d) this.t++;
        game.dialogSeen[this.flag] = true;

        if (this.flag === DIALOG_HINT_1) {
            console.log(Input.direction.m);
            if (Input.direction.m > 0) {
                console.log('BARF');
                this.cull = true;
                game.dialog = false;
            }
        } else if (this.flag === DIALOG_HINT_3) {
            if (Input.pressed[Input.Action.RELOAD]) {
                this.cull = true;
                game.dialog = false;
            }
        } else {
            if (Input.pressed[Input.Action.ATTACK]) {
                if (this.t < this.d) {
                    this.t = this.d;
                } else {
                    this.cull = true;
                    game.dialog = false;
                }
            }
        }
    }

    draw() {
        let length = Math.ceil((this.t / this.d) * this.text.length);
        let substr = this.text.slice(0, length);
        let idx = this.text.indexOf(' ', length - 1);
        if (idx < 0) idx = this.text.length;
        if (idx - length > 0) substr += '#'.repeat(idx - length);

        let sprite = Sprite.dialog_speech,
            spriteu = Viewport.center.u + 6,
            spritev = Viewport.center.v + 6,
            textu = spriteu + 12,
            textv = spritev + 5;

        if (!this.speech) {
            sprite = Sprite.dialog_hint;
            spriteu = Viewport.center.u - Sprite.dialog_hint.img.width / 2;
            spritev = Viewport.height - Sprite.dialog_hint.img.height - 8;
            textu = spriteu + 5;
            textv = spritev + 5;
        }

        Viewport.ctx.drawImage(sprite.img, spriteu, spritev);
        Text.drawParagraph(Viewport.ctx, substr, textu, textv, 110, 50, 1, Text.black, Text.black_shadow);
    }
}

Dialog.details = {
    [DIALOG_START_A]: {
        text:
            'SHOGGOTH\'S BALLS! THE PAGES OF THE SHOTGUN SPELLBOOK ARE SCATTERED ALL OVER THIS DUNGEON!',
        flag: DIALOG_START_A,
        speech: true
    },
    [DIALOG_START_B]: {
        text: 'FIND MY MISSING PAGES AND HELP ME REGAIN MY POWERS.',
        flag: DIALOG_START_B,
        required: DIALOG_START_A,
        speech: true
    },
    [DIALOG_HINT_1]: {
        text: 'PRESS abcd TO MOVE',
        flag: DIALOG_HINT_1,
        required: DIALOG_START_B,
        blockFire: true,
        blockReload: true
    },
    [DIALOG_HINT_2]: {
        text: 'PRESS l TO FIRE YOUR SHOTGUN',
        flag: DIALOG_HINT_2,
        required: DIALOG_HINT_1,
        blockReload: true
    },
    [DIALOG_HINT_3]: {
        text: 'PRESS r TO RELOAD',
        flag: DIALOG_HINT_3,
        required: DIALOG_HINT_2,
        blockFire: true
    },
    [DIALOG_HINT_DEATH]: {
        text: 'OUCH! BE CAREFUL OUT THERE, WE NEED THOSE PAGES BACK!',
        flag: DIALOG_HINT_DEATH,
        speech: true
    }
};
