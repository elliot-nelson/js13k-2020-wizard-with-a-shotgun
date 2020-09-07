import { game } from './Game';
import { R20, R70, R90, R360 } from './Constants';
import {
    vector2angle,
    angle2vector,
    vectorBetween,
    normalizeVector,
    vector2point
} from './Util';
import { Sprite } from './Sprite';
import { Behavior } from './systems/Behavior';
import { Page } from './Page';
import { Gore } from './Gore';
import { Viewport } from './Viewport';

/**
 * Monster
 */
export class Spindoctor {
    constructor(pos) {
        this.pos = { ...pos };
        this.vel = { x: 0, y: 0 };
        this.facing = { x: 0, y: -1, m: 0 };
        this.hp = 100;
        this.damage = [];
        this.radius = 3;
        this.mass = 1;
        this.bounce = true;
        this.state = Behavior.IDLE;
    }

    think() {
        if (this.state === Behavior.IDLE) {
            // Kick off at random angles, but, it looks weird to have straight horizontal
            // or vertical angles - so avoid anything within +- 20 degrees of a straight angle.
            let angle = Math.random() * R360;
            if (angle % R90 < R20) angle += R20;
            if (angle % R90 > R70) angle -= R20;
            this.facing = angle2vector(angle);
            this.vel = this.facing;
            this.state = Behavior.CHASE;
        } else if (this.state === Behavior.CHASE) {
            let v = normalizeVector(this.vel);
            v.m = (v.m + 2.5) / 2;
            this.vel = vector2point(v);

            let dist = vectorBetween(this.pos, game.player.pos);
            if (dist.m <= this.radius + game.player.radius) {
                game.player.damage.push({
                    amount: 5,
                    vector: dist,
                    knockback: 3
                });
            }
        } else if (this.state === Behavior.DEAD) {
            this.cull = true;
            Gore.kill(this);
            game.entities.push(new Page(this.pos));
            game.entities.push(new Page(this.pos));
        }
    }

    draw() {
        Sprite.drawViewportSprite(Sprite.spindoctor[0], this.pos, game.frame / 5);
        Sprite.drawViewportSprite(Sprite.spindoctor[1], this.pos);
    }
}
