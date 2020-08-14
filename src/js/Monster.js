import { game } from './Game';
import { Sprite } from './Assets';
import { Input } from './input/Input';
import { Geometry as G } from './Geometry';
import { Detection } from './Detection';
import { Behavior } from './systems/Behavior';

/**
 * Monster
 */
export class Monster {
  constructor() {
    this.pos = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };
    this.facing = { x: 0, y: -1, m: 0 };
    this.hp = 100;
  }

  think() {
    switch (this.state) {
      case Behavior.IDLE:
        if (Detection.lineOfSight(this, game.player)) {
          this.state = Behavior.CHASE;
        }
        break;
      case Behavior.CHASE:
        let diff = G.vectorBetween(this.pos, game.player.pos);
        diff.m = G.clamp(diff.m, 0, 1);
        this.vel = { x: diff.x * diff.m, y: diff.y * diff.m };
        break;
      default:
        this.state = Behavior.IDLE;
        break;
    }
  }

  draw(viewport) {
    // TODO
    Sprite.drawViewportSprite(viewport, Sprite.monster, this.pos, game.camera.pos);
  }
}
