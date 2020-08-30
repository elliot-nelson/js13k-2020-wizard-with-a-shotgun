import { game } from './Game';
import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { Geometry as G } from './Geometry';
import { Detection } from './Detection';
import { Behavior } from './systems/Behavior';
import { Constants as C } from './Constants';

/**
 * Monster
 */
export class Page {
  constructor(pos) {
    this.pos = { ...pos };
    this.angle = Math.random() * C.R360;
    this.vel = G.angle2vector(this.angle, Math.random() * 10 + 1);
    this.baseFrame = Math.random() * 60 | 0;

    this.mass = 1;

    this.noclip = true;
    this.bounce = true;
  }

  think() {
    this.vel.x *= 0.9;
    this.vel.y *= 0.9;
  }

  draw(viewport) {
    let w2 = Sprite.page.img.width;
    let ctx = viewport.ctx;

    /*let { u, v } = Sprite.viewportSprite2uv(viewport, sprite, this.pos, game.camera.pos);

    viewport.ctx.drawImage(Sprite.page_glow.img, u, v);
    viewport.ctx.drawImage(Sprite.page.img, u, v);*/

    let pos = {
      x: this.pos.x,
      y: this.pos.y + Math.sin((game.frame + this.baseFrame) / 30) * 2
    };

    Sprite.drawViewportSprite(viewport, Sprite.page_glow, pos, game.camera.pos);
    Sprite.drawViewportSprite(viewport, Sprite.page, pos, game.camera.pos);


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
}
