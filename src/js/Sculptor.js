import { game } from './Game';
import { Sprite } from './Sprite';
import { Input } from './input/Input';
import {
    vector2angle,
    angle2vector,
    vectorBetween,
    normalizeVector,
    vector2point
} from './Util';
import { Detection } from './Detection';
import { Behavior } from './systems/Behavior';
import { Constants as C } from './Constants';
import { Page } from './Page';
import { Gore } from './Gore';

/**
 * Monster
 */
export class Sculptor {
    constructor(pos) {
        this.pos = pos;
        this.vel = { x: 0, y: 0 };
        this.facing = { x: 0, y: -1, m: 0 };
        this.hp = 100;
        this.damage = [];
        this.radius = 3;

        this.mass = 1;

        this.bounce = true;
    }

    think() {
        switch (this.state) {
            case Behavior.IDLE:
                // Kick off at random angles, but, it looks weird to have straight horizontal
                // or vertical angles - so avoid anything within +- 20 degrees of a straight angle.
                let angle = Math.random() * C.R360;
                if (angle % C.R90 < C.R20) angle += C.R20;
                if (angle % C.R90 > C.R70) angle -= C.R20;
                this.facing = angle2vector(angle);
                this.vel = this.facing;
                this.state = Behavior.CHASE;
                break;
            case Behavior.CHASE:
                let playerAngle = vector2angle(
                    vectorBetween(this.pos, game.player.pos)
                );
                let velAngle = vector2angle(this.vel);

                /*if closestAngleDifference(velAngle, playerAngle) < C.R90) {
            velAngle =intermediateAngle(velAngle, playerAngle, 0.01);
            this.vel =angle2vector(velAngle);
        }*/

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

                break;
            case Behavior.DEAD:
                this.cull = true;
                Gore.kill(this);
                game.entities.push(new Page(this.pos));
                game.entities.push(new Page(this.pos));
                break;
            default:
                this.state = Behavior.IDLE;
                break;
        }
    }

    draw(viewport) {
        // TODO
        if (this.state === Behavior.DEAD) {
            Sprite.drawViewportSprite(
                viewport,
                Sprite.monster_dead,
                this.pos,
                game.camera.pos
            );
        } else {
            let { u, v } = Sprite.viewportSprite2uv(
                viewport,
                Sprite.sawblade,
                this.pos,
                game.camera.pos
            );
            u += Sprite.sawblade.anchor.x;
            v += Sprite.sawblade.anchor.y;

            viewport.ctx.save();
            viewport.ctx.translate(u, v);
            viewport.ctx.rotate(game.frame / 5);
            Sprite.drawSprite(viewport.ctx, Sprite.sawblade, 0, 0);
            viewport.ctx.restore();
            Sprite.drawSprite(viewport.ctx, Sprite.sawblade_eyes, u, v);
        }
    }
}
