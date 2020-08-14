import { game } from './Game';
import { Sprite } from './Assets';
import { Input } from './input/Input';

/**
 * Monster
 */
export class Bullet {
  constructor() {
    this.pos = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };
    console.log("created");
  }

  think() {
    this.vel.x *= 0.85;
    this.vel.y *= 0.85;

    this.pos.x += this.vel.x;
    this.pos.y += this.vel.y;

    if (Math.abs(this.vel.x) < 1 && Math.abs(this.vel.y) < 1) {
      console.log("culled");
      this.cull = true;
    }
  }

  draw(viewport) {
    Sprite.drawViewportSprite(viewport, Sprite.bullet, this.pos, game.camera.pos);
  }
}
