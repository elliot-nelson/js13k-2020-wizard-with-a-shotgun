import { game } from './Game';
import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { angle2vector, vectorBetween } from './Util';
import { Detection } from './Detection';
import { Behavior } from './systems/Behavior';
import { Constants as C } from './Constants';
import { PageCollectedAnimation } from './PageCollectedAnimation';

/**
 * Monster
 */
export class Page {
  constructor(pos) {
    this.pos = { ...pos };
    this.angle = Math.random() * C.R360;
    this.vel = angle2vector(this.angle, Math.random() * 30 + 1);
    this.baseFrame = Math.random() * 60 | 0;
    //this.mass = 1;
    this.radius = 3;
    this.noClipEntity = true;
  }

  think() {
    this.vel.x *= 0.9;
    this.vel.y *= 0.9;

    let v = vectorBetween(this.pos, game.player.pos);
    if (v.m < game.player.radius + this.radius) {
      this.cull = true;
      game.entities.push(new PageCollectedAnimation(this.pos));
    }
  }

  draw(viewport) {
    let pos = {
      x: this.pos.x,
      y: this.pos.y + Math.sin((game.frame + this.baseFrame) / 30) * 2
    };

    Sprite.drawViewportSprite(viewport, Sprite.page_glow, pos, game.camera.pos);
    Sprite.drawViewportSprite(viewport, Sprite.page, pos, game.camera.pos);
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
