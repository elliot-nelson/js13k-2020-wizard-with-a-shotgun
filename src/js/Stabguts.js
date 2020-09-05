import { game } from './Game';
import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { vectorBetween, clamp } from './Util';
import { Detection } from './Detection';
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
        this.radius = 11;
        this.mass = 0.5;
        this.state = Behavior.IDLE;
    }

    think() {
        if (this.state === Behavior.IDLE) {
            this.state = Behavior.CHASE;
        } else if (this.state === Behavior.CHASE) {
            let diff = vectorBetween(this.pos, game.player.pos);

            if (diff.m < 24) {
                this.state = Behavior.ATTACK;
                this.frames = 35;
            }

            diff.m = clamp(diff.m, 0, 1);
            this.vel = { x: diff.x * diff.m, y: diff.y * diff.m };
        } else if (this.state === Behavior.ATTACK) {
            if (this.frames-- === 0) {
                this.state = Behavior.CHASE;
            }
        } else if (this.state === Behavior.DEAD) {
            this.cull = true;
            Gore.kill(this);
            game.entities.push(new Page(this.pos));
            game.entities.push(new Page(this.pos));
        }
    }

    draw() {
        let sprite = this.state === Behavior.ATTACK ? Sprite.stabguts[3] : Sprite.stabguts[0];
        Sprite.drawViewportSprite(
            sprite,
            this.pos
        );
    }
}
