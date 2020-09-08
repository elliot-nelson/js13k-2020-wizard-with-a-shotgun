'use strict';

import { game } from './Game';
import { Sprite } from './Sprite';
import { Input } from './input/Input';
import {
    vectorBetween,
    vector2point,
    normalizeVector,
    uv2xy,
    vector2angle
} from './Util';
import { ShotgunBlast } from './ShotgunBlast';
import { TILE_SIZE, R90, DIALOG_HINT_DEATH } from './Constants';
import { Behavior } from './systems/Behavior';
import { ReloadAnimation } from './ReloadAnimation';
import { Audio } from './Audio';
import { Gore } from './Gore';
import { Viewport } from './Viewport';
import { SpawnAnimation } from './SpawnAnimation';
import { Page } from './Page';

/**
 * Player
 */
export class Player {
    constructor() {
        this.pos = {
            x: (game.maze.rooms[1].q + game.maze.rooms[1].w / 2) * TILE_SIZE,
            y: (game.maze.rooms[1].r + game.maze.rooms[1].h / 2) * TILE_SIZE
        };
        this.history = [];
        this.vel = { x: 0, y: 0 };
        this.facing = { x: 0, y: -1, m: 0 };
        this.hp = 100;
        this.damage = [];
        this.radius = 11;
        this.shellsLeft = 4;
        this.shellsMax = 4;
        this.forcedReload = false;
        this.mass = 3;
        this.pages = 0;
        this.deaths = 0;
        this.state = Behavior.SPAWN;
        this.frames = 30;
    }

    think() {
        this.history.unshift({ ...this.pos });
        this.history.splice(50);

        if (this.state === Behavior.HUNT) {
            if (!(game.dialog && game.dialog.blockMove)) {
                this.defaultMovement(1);
            }

            if (!(game.dialog && game.dialog.blockFire)) {
                if (Input.pressed[Input.Action.ATTACK]) {
                    if (this.shellsLeft === 0) {
                        this.reload();
                    } else {
                        this.fire();
                    }
                }
            }

            if (!(game.dialog && game.dialog.blockReload)) {
                if (Input.pressed[Input.Action.RELOAD]) {
                    if (this.shellsLeft < this.shellsMax) {
                        this.reload();
                    } else {
                        // play nasty noise
                    }
                }
            }

            if (this.deaths > 0) {
                game.dialogPending[DIALOG_HINT_DEATH] = true;
            }
        } else if (this.state === Behavior.ATTACK) {
            this.defaultMovement(1);
            if (--this.frames <= 0) {
                if (this.shellsLeft === 0) {
                    this.reload(true);
                } else {
                    this.state = Behavior.HUNT;
                }
            }
        } else if (this.state === Behavior.RELOAD) {
            this.defaultMovement(this.forcedReload ? 0.5 : 2.0);
            if (--this.frames <= 0) {
                this.shellsLeft = this.shellsMax;
                this.state = Behavior.HUNT;
            }
        } else if (this.state === Behavior.DEAD) {
            this.state = Behavior.SPAWN;
            this.frames = 120;
            this.hp = 100;
            this.deaths++;
            this.releasePages();
            Gore.kill(this);
            Gore.kill(this);
        } else if (this.state === Behavior.SPAWN) {
            this.frames--;
            if (this.frames === 30) {
                this.pos = {
                    x: (game.maze.rooms[1].q + game.maze.rooms[1].w / 2) * TILE_SIZE,
                    y: (game.maze.rooms[1].r + game.maze.rooms[1].h / 2) * TILE_SIZE
                };
                this.vel = { x: 0, y: 0 };
                if (game.brawl) {
                    for (let entity of game.brawl.enemies) {
                        entity.cull = true;
                    }
                    game.brawl = false;
                }
            } else if (this.frames === 0) {
                this.state = Behavior.HUNT;
                game.entities.push(new SpawnAnimation(this.pos));
            }
        }
    }

    defaultMovement(velocityAdj) {
        if (Input.pointer) {
            this.facing = vectorBetween(this.pos, uv2xy(Input.pointer));
            this.facingAngle = vector2angle(this.facing);
        }

        let v = {
            x:
                Input.direction.x *
                Input.direction.m *
                1.7 *
                velocityAdj,
            y:
                Input.direction.y *
                Input.direction.m *
                1.7 *
                velocityAdj
        };

        this.vel.x = (this.vel.x + v.x) / 2;
        this.vel.y = (this.vel.y + v.y) / 2;
    }

    fire() {
        Audio.play(Audio.shotgun);

        this.state = Behavior.ATTACK;
        this.frames = 10;
        this.shellsLeft--;

        let pos = {
            x: this.pos.x + this.facing.x * 8 - this.facing.y * 3,
            y: this.pos.y + this.facing.y * 8 + this.facing.x * 3
        };

        game.entities.push(new ShotgunBlast(pos, this.facingAngle));

        // player knockback
        this.vel = vector2point({ ...normalizeVector(this.facing), m: -1 });
    }

    reload(forced) {
        this.forcedReload = forced;
        this.state = Behavior.RELOAD;
        this.frames = 20;
        this.shellsLeft = 0;
        game.entities.push(new ReloadAnimation(this.frames));
    }

    draw() {
        if (this.state === Behavior.DEAD || this.state === Behavior.SPAWN) return;

        let sprite = Sprite.player[((game.frame / 30) | 0) % 2],
            blast;

        if (this.state === Behavior.ATTACK && this.frames >= 2) {
            sprite = Sprite.player[2];
            blast = Sprite.shotgun_blast[6 - this.frames];
        }

        //Sprite.drawViewportSprite(sprite, this.pos, this.facingAngle + R90);

        let hf = this.state === Behavior.RELOAD && !this.forcedReload ? 15 : 0;
        for (let i = Math.min(hf, history.length); i >= 0; i--) {
            let { u, v } = Sprite.viewportSprite2uv(
                sprite,
                this.history[i]
            );

            Viewport.ctx.save();
            Viewport.ctx.globalAlpha = i === 0 ? 1 : 0.5;
            Viewport.ctx.translate(u + sprite.anchor.x, v + sprite.anchor.y);
            Viewport.ctx.rotate(this.facingAngle + R90);

            Viewport.ctx.drawImage(
                sprite.img,
                -sprite.anchor.x,
                -sprite.anchor.y
            );
            if (blast) {
                Viewport.ctx.drawImage(
                    blast.img,
                    3 - blast.anchor.x,
                    -20 - blast.anchor.y
                );
            }
            Viewport.ctx.restore();
        }
    }

    releasePages() {
        let number = Math.min(this.pages, 7);
        let amount = this.pages / number | 0;
        let remainder = this.pages - amount * number;

        for (let i = 0; i < number; i++) {
            game.entities.push(new Page(this.pos, amount + remainder));
            remainder = 0;
        }
        this.pages = 0;
    }
}
