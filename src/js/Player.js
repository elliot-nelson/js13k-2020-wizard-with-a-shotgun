import { game } from './Game';
import { Sprite } from './Assets';
import { Input } from './input/Input';
import { Geometry as G } from './Geometry';
import { Bullet } from './Bullet';
import { ShotgunBlast } from './ShotgunBlast';
import { Constants as C } from './Constants';

/**
 * Player
 */
export class Player {
  constructor() {
    this.pos = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };
    this.facing = { x: 0, y: -1, m: 0 };
    this.hp = 100;
    this.damage = 0;
    this.radius = 12;

    this.shellsLeft = 4;
    this.shellsMax = 4;

    this.mass = 3;
  }

  think() {
    if (game.pointerXY()) {
      this.facing = G.vectorBetween(this.pos, game.pointerXY());
    }

    let v = {
      x: game.input.direction.x * game.input.direction.m * 2.5,
      y: game.input.direction.y * game.input.direction.m * 2.5
    };
    this.vel.x = (this.vel.x + v.x) / 2;
    this.vel.y = (this.vel.y + v.y) / 2;

    if (game.input.pressed[Input.Action.ATTACK]) {
      this.fireShotgun();
    }
    if (game.input.pressed[Input.Action.RELOAD]) {
      this.shellsLeft = this.shellsMax;
    }
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

  fireShotgun() {
    if (this.shellsLeft === 0) return;
    this.shellsLeft--;

    let angle = G.vector2angle(this.facing);
    game.entities.push(new ShotgunBlast(this.pos, angle));

    /*
    let spread = G.RAD[60];
    let pellets = 12;
    // shotgun: 60, 12, 10
    // sniper: 5, 12, 40

    for (let idx = 0; idx < pellets; idx++) {
      let pelletAngle = (idx * spread / (pellets - 1)) + angle - spread / 2;
      let pelletVector = G.angle2vector(pelletAngle);
      let bullet = new Bullet();
      bullet.pos = { ...this.pos };
      bullet.vel = { x: pelletVector.x * 10, y: pelletVector.y * 10 };
      game.entities.push(bullet);
    }
    */

  }
}
