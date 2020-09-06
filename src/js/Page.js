import { game } from './Game';
import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { angle2vector, vectorBetween } from './Util';
import { Behavior } from './systems/Behavior';
import { R360 } from './Constants';
import { PageCollectedAnimation } from './PageCollectedAnimation';

/**
 * Monster
 */
export class Page {
    constructor(pos, amount = 1) {
        this.pos = { ...pos };
        this.amount = amount;
        this.angle = Math.random() * R360;
        this.vel = angle2vector(this.angle, Math.random() * 30 + 1);
        this.baseFrame = (Math.random() * 60) | 0;
        //this.mass = 1;
        this.radius = 3;
        this.noClipEntity = true;
    }

    think() {
        this.vel.x *= 0.95;
        this.vel.y *= 0.95;

        let v = vectorBetween(this.pos, game.player.pos);
        if (v.m < game.player.radius + this.radius && game.player.state === Behavior.HUNT) {
            this.cull = true;
            game.entities.push(new PageCollectedAnimation(this.pos, this.amount));
        }
    }

    draw() {
        let pos = {
            x: this.pos.x,
            y: this.pos.y + Math.sin((game.frame + this.baseFrame) / 30) * 2
        };

        Sprite.drawViewportSprite(
            Sprite.page_glow,
            pos
        );
        Sprite.drawViewportSprite(Sprite.page, pos);
    }

    /*
    Sprite.

    ctx.save();
    ctx.translate(100, 100);
    ctx.scale(Math.sin((this.frame - 1) / 15), 1);
    ctx.drawImage(Sprite.page_glow.img, -w2 / 2, -5);
    ctx.restore();

    ctx.save();
    ctx.translate(100, 100);
    ctx.scale(Math.sin(this.frame / 15), 1);
    ctx.drawImage(Sprite.page.img, -w2 / 2, -5);
    ctx.restore();a
    */
}
