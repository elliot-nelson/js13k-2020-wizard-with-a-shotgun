'use strict';

import { game } from './Game';
import { Sprite } from './Sprite';
import { Text } from './Text';
import { Input } from './input/Input';
import { Viewport } from './Viewport';
import { DIALOG_START_A, DIALOG_START_B, DIALOG_HINT_1, DIALOG_HINT_2, DIALOG_HINT_3, DIALOG_HINT_DEATH, DIALOG_HINT_E1, DIALOG_HINT_E2, DIALOG_HINT_DMG } from './Constants';
import { partialText } from './Util';

export class Dialog {
    constructor(key) {
        let dialog = Dialog.details[key];
        this.flag = key;
        this.text = dialog.text;
        this.speech = dialog.speech;
        this.blockReload = dialog.blockReload;
        this.blockFire = dialog.blockFire;
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
            if (Input.direction.m > 0) {
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
        let sprite = Sprite.dialog_speech,
            spriteu = Viewport.center.u + 5,
            spritev = Viewport.center.v + 8,
            textu = spriteu + 8,
            textv = spritev + 12;

        if (!this.speech) {
            sprite = Sprite.dialog_hint;
            spriteu = Viewport.center.u - Sprite.dialog_hint.img.width / 2;
            spritev = Viewport.height - Sprite.dialog_hint.img.height - 8;
            textu = spriteu + 5;
            textv = spritev + 5;
        }

        Viewport.ctx.drawImage(sprite.img, spriteu, spritev);
        Text.drawParagraph(
            Viewport.ctx,
            partialText(this.text, this.t, this.d),
            textu, textv,
            115, 50,
            1,
            Text.black,
            Text.black_shadow
        );
    }
}

Dialog.details = [
    {
        text: 'SHOGGOTH\'S ARMPIT! THE SHOTGUN ARCANA IS SCATTERED ALL OVER THIS DUNGEON!',
        speech: true
    },
    {
        text: 'HELP ME FIND MY MISSING PAGES AND REGAIN MY POWERS.',
        speech: true
    },
    {
        text: 'USE WASD OR mnop TO MOVE',
        blockFire: true,
        blockReload: true
    },
    {
        text: 'USE l TO FIRE YOUR SHOTGUN',
        blockReload: true
    },
    {
        text: 'USE r TO RELOAD',
        blockFire: true
    },
    {
        text: 'BE CAREFUL OUT THERE, WE NEED THOSE PAGES BACK!',
        speech: true
    },
    {
        text: 'STABGUTS! LOOK OUT FOR THE POINTY END.',
        speech: true
    },
    {
        text: 'SPINDOCTORS! YOU\'LL GET MORE THAN A HAIRCUT FROM THOSE THINGS.',
        speech: true
    },
    {
        text: 'DON\'T FORGET, PICK UP LOST PAGES TO RECOVER SOME HEALTH!',
        speech: true
    }
];
