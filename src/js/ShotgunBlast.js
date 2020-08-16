'use strict';

import { game } from './Game';
import { Monster } from './Monster';
import { Sprite } from './Assets';
import { Geometry as G } from './Geometry';
import { viewport } from './Viewport';

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
      let entities = game.entities.filter(entity => entity instanceof Monster);
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
        console.log(["going to check", this.pos, k]);
        for (let tile of G.tilesHitBy(this.pos, G.angle2vector(sides[0], vect.m))) {
          console.log([tile, G.tileIsPassable(tile.q, tile.r)]);
          if (!G.tileIsPassable(tile.q, tile.r)) {
            wallHit.push(tile);
            break;
          }
        }
        for (let tile of G.tilesHitBy(this.pos, G.angle2vector(sides[1], vect.m))) {
          console.log([tile, G.tileIsPassable(tile.q, tile.r)]);
          if (!G.tileIsPassable(tile.q, tile.r)) {
            wallHit.push(tile);
            break;
          }
        }

        if (wallHit.length < 2) {
          // hit
          entity.damage += 200;
        }
      }

      this.cull = true;
    }
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


          let entities = game.entities.filter(entity => entity instanceof Monster);
          let entity = entities[0];
          if (entity) {
              let vect = G.vectorBetween(this.pos, entity.pos);
            viewport.ctx.strokeStyle = 'yellow';
            viewport.ctx.beginPath();
            let k1 = G.xy2uv({ x: entity.pos.x - vect.y * 1, x: entity.pos.y + vect.x * 1 });
            let k2 = G.xy2uv({ x: entity.pos.x + vect.y * 1, x: entity.pos.y - vect.x * 1 });
            let k3 = G.xy2uv(this.pos);
            let k4 = G.xy2uv({ x: this.pos.x + vect.x * vect.m, y: this.pos.y + vect.y * vect.m });

            let k5 = G.xy2uv({ x: entity.pos.x - vect.y * 15, y: entity.pos.y + vect.x * 15 });
            let k6 = G.xy2uv({ x: entity.pos.x + vect.y * 15, y: entity.pos.y - vect.x * 15 });


            viewport.ctx.moveTo(k3.u, k3.v);
            viewport.ctx.lineTo(k4.u, k4.v);
            viewport.ctx.moveTo(k3.u, k3.v);
            viewport.ctx.lineTo(k1.u, k1.v);
            viewport.ctx.stroke();

            viewport.ctx.beginPath();
            viewport.ctx.strokeStyle = 'green';
            viewport.ctx.moveTo(k3.u, k3.v);
            viewport.ctx.lineTo(k5.u, k5.v);
            viewport.ctx.moveTo(k3.u, k3.v);
            viewport.ctx.lineTo(k6.u, k6.v);
            viewport.ctx.stroke();

            //viewport.ctx.moveTo(k3.u, k3.v);
            //viewport.ctx.lineTo(k3.u + 5, k3.v + 5);
            //viewport.ctx.stroke();
          }
  }
}
