import { game } from './Game';
import { Sprite } from './Assets';
import { Input } from './input/Input';
import { Geometry as G } from './Geometry';
import { Bullet } from './Bullet';
import { ShotgunBlast } from './ShotgunBlast';
import { Constants as C } from './Constants';
import { Behavior } from './systems/Behavior';
import { ReloadAnimation } from './ReloadAnimation';

/**
 * Player
 */
export class Player {
  constructor() {
    this.pos = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };
    this.facing = { x: 0, y: -1, m: 0 };
    this.hp = 100;
    this.damage = [];
    this.radius = 12;

    this.shellsLeft = 4;
    this.shellsMax = 4;

    this.mass = 3;
  }

  think() {
    switch (this.state) {
      case Behavior.HUNT:
        this.defaultMovement(1);

        if (game.input.pressed[Input.Action.ATTACK]) {
          if (this.shellsLeft === 0) {
            this.reload();
          } else {
            this.fire();
          }
        }

        if (game.input.pressed[Input.Action.RELOAD]) {
          this.reload();
        }

        break;
      case Behavior.ATTACK:
        this.defaultMovement(1);
        if (--this.frames <= 0) this.state = Behavior.HUNT;
        break;
      case Behavior.RELOAD:
        this.defaultMovement(2.5);
        if (--this.frames <= 0) {
          this.shellsLeft = this.shellsMax;
          this.state = Behavior.HUNT;
        }
        break;
      default:
        this.state = Behavior.HUNT;
        this.frames = 0;
        break;
    }
  }

  defaultMovement(velocityAdj) {
    if (game.pointerXY()) {
      this.facing = G.vectorBetween(this.pos, game.pointerXY());
    }

    let v = {
      x: game.input.direction.x * game.input.direction.m * 1.8 * velocityAdj,
      y: game.input.direction.y * game.input.direction.m * 1.8 * velocityAdj
    };

    this.vel.x = (this.vel.x + v.x) / 2;
    this.vel.y = (this.vel.y + v.y) / 2;
  }

  draw(viewport) {
    Sprite.drawViewportSprite(viewport, Sprite.player, this.pos, game.camera.pos);

    viewport.ctx.strokeStyle = 'rgba(255, 255, 64, 0.3)';
    viewport.ctx.beginPath();
    let uv = game.xy2uv(this.pos);
    viewport.ctx.arc(uv.u, uv.v, C.PLAYER_BOUND_RADIUS, 0, 2 * Math.PI);
    viewport.ctx.setLineDash([2, 1]);
    viewport.ctx.stroke();
    viewport.ctx.setLineDash([]);
  }

  fire() {
    this.state = Behavior.ATTACK;
    this.frames = 6;
    this.shellsLeft--;

    let angle = G.vector2angle(this.facing);
    game.entities.push(new ShotgunBlast(this.pos, angle));

    this.vel = G.normalizeVector(this.facing);
    this.vel.m = 1;
  }

  reload() {
    this.state = Behavior.RELOAD;
    this.frames = 12;
    game.entities.push(new ReloadAnimation(this.frames));
  }
}
