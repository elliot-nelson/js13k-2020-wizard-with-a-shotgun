'use strict';

import { game } from './Game';
import { Monster } from './Monster';
import { Sprite } from './Assets';

export class ShotgunBlast {
    constructor(pos, angle) {
        this.pos = { ...pos };
        this.angle = angle;
    }

    think() {
      this.t = (this.t || 0) + 1;

      if (this.t > 5) {
          let affected = game.entities.filter(entity => entity instanceof Monster);
          for (let entity of affected) {
              entity.damage += 200;
          }
          this.cull = true;
      }
    }

  draw(viewport) {
    // TODO
    Sprite.drawViewportSprite(viewport, Sprite.monster, this.pos, game.camera.pos);
  }
}
