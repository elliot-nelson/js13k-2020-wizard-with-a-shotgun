'use strict';

import { game } from './Game';
import { Monster } from './Monster';
import { Sprite } from './Assets';
import { Geometry as G } from './Geometry';
import { viewport } from './Viewport';
import { Player } from './Player';

export class ShotgunBlast {
  constructor(pos, angle) {
    this.pos = { ...pos };
    this.angle = angle;
    this.spread = G.RAD[70];
    this.range = 55;
  }

  think() {
    this.t = (this.t || 0) + 1;

    if (this.t === 3) {
      let entities = game.entities.filter(entity => entity.hp && !(entity instanceof Player));
      for (let entity of entities) {
        let vect = G.vectorBetween(this.pos, entity.pos);
        if (vect.m >= this.range + entity.radius) continue;

        let dot1 = G.vectorBetween(
          this.pos,
          { x: entity.pos.x - vect.y * entity.radius, y: entity.pos.y + vect.x * entity.radius }
        );
        let dot2 = G.vectorBetween(
          this.pos,
          { x: entity.pos.x + vect.y * entity.radius, y: entity.pos.y - vect.x * entity.radius }
        );
        let sides = [G.vector2angle(dot1), G.vector2angle(dot2)];
        let overlap = G.arcOverlap(sides[0], sides[1], this.angle - this.spread / 2, this.angle + this.spread / 2);
        if (!overlap) continue;

        let wallHit = [];
        let k = G.vectorAdd(this.pos, G.angle2vector(sides[0], vect.m));
        for (let tile of G.tilesHitBy(this.pos, G.angle2vector(sides[0], vect.m))) {
          if (!G.tileIsPassable(tile.q, tile.r)) {
            wallHit.push(tile);
            break;
          }
        }
        for (let tile of G.tilesHitBy(this.pos, G.angle2vector(sides[1], vect.m))) {
          if (!G.tileIsPassable(tile.q, tile.r)) {
            wallHit.push(tile);
            break;
          }
        }

        if (wallHit.length < 2) {
          // hit
          entity.damage.push({ amount: 100, vector: vect });
        }
      }
    }

    if (this.t > 6) this.cull = true;
  }

  draw(viewport) {
    // TODO
    //Sprite.drawViewportSprite(viewport, Sprite.monster, this.pos, game.camera.pos);
    let uv = G.xy2uv(this.pos);
    viewport.ctx.beginPath();
    viewport.ctx.arc(uv.u, uv.v, this.range, this.angle - this.spread / 2, this.angle + this.spread / 2);
    viewport.ctx.lineTo(uv.u, uv.v);
    viewport.ctx.closePath();
    viewport.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
    viewport.ctx.fill();
  }
}
