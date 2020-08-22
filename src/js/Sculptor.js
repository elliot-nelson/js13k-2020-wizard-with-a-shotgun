import { game } from './Game';
import { Sprite } from './Assets';
import { Input } from './input/Input';
import { Geometry as G } from './Geometry';
import { Detection } from './Detection';
import { Behavior } from './systems/Behavior';
import { Constants as C } from './Constants';

/**
 * Monster
 */
export class Sculptor {
  constructor() {
    this.pos = { x: 0, y: 0 };
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
        this.facing = G.angle2vector(Math.random() * Math.PI * 2);
        this.vel = this.facing;
        this.state = Behavior.CHASE;
        break;
      case Behavior.CHASE:
        let playerAngle = G.vector2angle(G.vectorBetween(this.pos, game.player.pos));
        let velAngle = G.vector2angle(this.vel);

        /*if (G.closestAngleDifference(velAngle, playerAngle) < C.R90) {
            velAngle = G.intermediateAngle(velAngle, playerAngle, 0.01);
            this.vel = G.angle2vector(velAngle);
        }*/

        let v = G.normalizeVector(this.vel);
        v.m = (v.m + 3) / 2;
        this.vel = G.vector2point(v);
        break;
      case Behavior.DEAD:
        this.vel = { x: 0, y: 0, m: 0 };
        if (!this.cullt) this.cullt = 15;
        this.cullt--;
        if (this.cullt < 1) this.cull = true;
        break;
      default:
        this.state = Behavior.IDLE;
        break;
    }
  }

  draw(viewport) {
    // TODO
    if (this.state === Behavior.DEAD) {
      Sprite.drawViewportSprite(viewport, Sprite.monster_dead, this.pos, game.camera.pos);
    } else {
      let { u, v } = Sprite.viewportSprite2uv(viewport, Sprite.sawblade, this.pos, game.camera.pos);
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
