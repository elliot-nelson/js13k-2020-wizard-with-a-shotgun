'use strict';

import { game } from './Game';
import { R90, DIALOG_HINT_E1 } from './Constants';
import { vectorBetween, clamp, vector2angle } from './Util';
import { Sprite } from './Sprite';
import { CHASE, DEAD, ATTACK, RELOAD } from './systems/Behavior';
import { Gore } from './Gore';
import { Page } from './Page';

/**
 * Monster
 */
export class Stabguts {
    constructor(pos) {
        this.pos = { ...pos };
        this.hp = 200;
        this.damage = [];
        this.vel = { x: 0, y: 0 };
        this.facing = { x: 0, y: -1, m: 0 };
        this.radius = 8;
        this.mass = 0.5;
        this.lastAttack = 0;
        this.state = CHASE;
        game.dialogPending[DIALOG_HINT_E1] = true;
    }

    think() {
        let diff = this.facing = vectorBetween(this.pos, game.player.pos);
        this.facingAngle = vector2angle(this.facing);
        if (this.state === CHASE) {
            if (diff.m < 38 && Math.random() < 0.05 && game.frame > this.lastAttack + 60) {
                this.state = RELOAD;
                this.frames = 24;
            }
            diff.m = clamp(diff.m, 0, 0.75);
            this.vel = {
                x: (this.vel.x + diff.x * diff.m) / 2,
                y: (this.vel.y + diff.y * diff.m) / 2
            };
        } else if (this.state === RELOAD) {
            if (this.frames-- === 0) {
                this.state = ATTACK;
                this.frames = 12;
            }
            this.vel = { x: 0, y: 0 };
        } else if (this.state === ATTACK) {
            if (this.frames-- === 0) {
                this.state = CHASE;
                this.lastAttack = game.frame;
            }
            if (this.frames === 1 && diff.m < 23) {
                game.player.damage.push({
                    amount: 12,
                    vector: diff,
                    knockback: 5
                });
            }
            diff.m = clamp(diff.m, 0, 3);
            this.vel = { x: diff.x * diff.m, y: diff.y * diff.m };
        } else if (this.state === DEAD) {
            this.cull = true;
            Gore.kill(this);
            game.entities.push(new Page(this.pos, 1));
            game.entities.push(new Page(this.pos, 2));
        }
    }

    draw() {
        let sprite = Sprite.stabguts[((game.frame / 12) | 0) % 2];
        this.state === RELOAD && (sprite = Sprite.stabguts[2]);
        this.state === ATTACK && (sprite = Sprite.stabguts[3]);
        Sprite.drawViewportSprite(
            sprite,
            this.pos,
            this.facingAngle + R90
        );
    }
}
