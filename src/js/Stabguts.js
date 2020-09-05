'use strict';

import { game } from './Game';
import { R90 } from './Constants';
import { vectorBetween, clamp, vector2angle } from './Util';
import { Sprite } from './Sprite';
import { Behavior } from './systems/Behavior';
import { Gore } from './Gore';
import { Page } from './Page';

/**
 * Monster
 */
export class Stabguts {
    constructor(pos) {
        this.pos = { ...pos };
        this.vel = { x: 0, y: 0 };
        this.facing = { x: 0, y: -1, m: 0 };
        this.hp = 100;
        this.damage = [];
        this.radius = 8;
        this.mass = 0.5;
        this.state = Behavior.IDLE;
        this.lastAttack = 0;
    }

    think() {
        let diff = this.facing = vectorBetween(this.pos, game.player.pos);
        this.facingAngle = vector2angle(this.facing);

        if (this.state === Behavior.IDLE) {
            this.state = Behavior.CHASE;
        } else if (this.state === Behavior.CHASE) {
            if (diff.m < 38 && Math.random() < 0.05 && game.frame > this.lastAttack + 60) {
                this.state = Behavior.RELOAD;
                this.frames = 24;
            }
            diff.m = clamp(diff.m, 0, 0.75);
            this.vel = { x: diff.x * diff.m, y: diff.y * diff.m };
        } else if (this.state === Behavior.RELOAD) {
            if (this.frames-- === 0) {
                this.state = Behavior.ATTACK;
                this.frames = 12;
            }
            this.vel = { x: 0, y: 0 };
        } else if (this.state === Behavior.ATTACK) {
            if (this.frames-- === 0) {
                this.state = Behavior.CHASE;
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
        } else if (this.state === Behavior.DEAD) {
            this.cull = true;
            Gore.kill(this);
            game.entities.push(new Page(this.pos));
            game.entities.push(new Page(this.pos));
        }
    }

    draw() {
        let sprite = Sprite.stabguts[((game.frame / 12) | 0) % 2];
        this.state === Behavior.RELOAD && (sprite = Sprite.stabguts[2]);
        this.state === Behavior.ATTACK && (sprite = Sprite.stabguts[3]);
        Sprite.drawViewportSprite(
            sprite,
            this.pos,
            this.facingAngle + R90
        );
    }
}
