import { game } from './Game';
import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { angle2vector, vectorBetween, vector2point } from './Util';
import { DEAD, SPAWN } from './systems/Behavior';
import { R360 } from './Constants';
import { PageCollectedAnimation } from './PageCollectedAnimation';

/**
 * Page
 */
export class Page {
    constructor(pos, amount) {
        this.pos = { ...pos };
        this.amount = amount;
        this.angle = Math.random() * R360;
        this.vel = vector2point(angle2vector(this.angle, Math.random() * 3 + 1));
        this.baseFrame = (Math.random() * 60) | 0;
        //this.mass = 1;
        this.radius = 3;
        this.noClipEntity = true;
        this.page = true;
    }

    think() {
        this.vel.x *= 0.95;
        this.vel.y *= 0.95;

        let v = vectorBetween(this.pos, game.player.pos);
        if (v.m < game.player.radius + this.radius + 2 && game.player.state !== DEAD && game.player.state !== SPAWN) {
            this.cull = true;
            game.entities.push(new PageCollectedAnimation(this.pos, this.amount));
        }
    }

    draw() {
        let pos = {
            x: this.pos.x,
            y: this.pos.y + Math.sin((game.frame + this.baseFrame) / 30) * 2
        };

        Sprite.drawViewportSprite(Sprite.page[1], pos);
        Sprite.drawViewportSprite(Sprite.page[0], pos);
    }
}
