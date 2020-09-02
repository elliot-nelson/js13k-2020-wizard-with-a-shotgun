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
import { Constants as C } from './Constants';
import { Behavior } from './systems/Behavior';
import { ReloadAnimation } from './ReloadAnimation';
import { Audio } from './Audio';

/**
 * Player
 */
export class Player {
    constructor() {
        this.pos = { x: 0, y: 0 };
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

        this.pages = 11;
    }

    think() {
        this.history.unshift({ ...this.pos });
        this.history.splice(50);

        switch (this.state) {
            case Behavior.HUNT:
                if (!(game.dialog && game.dialog.blockMove)) {
                    this.defaultMovement(1);
                }

                if (!(game.dialog && game.dialog.blockFire)) {
                    if (game.input.pressed[Input.Action.ATTACK]) {
                        if (this.shellsLeft === 0) {
                            this.reload();
                        } else {
                            this.fire();
                        }
                    }
                }

                if (!(game.dialog && game.dialog.blockReload)) {
                    if (game.input.pressed[Input.Action.RELOAD]) {
                        if (this.shellsLeft < this.shellsMax) {
                            this.reload();
                        } else {
                            // play nasty noise
                        }
                    }
                }

                break;
            case Behavior.ATTACK:
                this.defaultMovement(1);
                if (--this.frames <= 0) {
                    if (this.shellsLeft === 0) {
                        this.reload(true);
                    } else {
                        this.state = Behavior.HUNT;
                    }
                }
                break;
            case Behavior.RELOAD:
                this.defaultMovement(this.forcedReload ? 0.5 : 2.0);
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
        let pointer = game.input.pointer;
        if (pointer) {
            this.facing = vectorBetween(this.pos, uv2xy(pointer));
            this.facingAngle = vector2angle(this.facing);
        }

        let v = {
            x:
                game.input.direction.x *
                game.input.direction.m *
                1.7 *
                velocityAdj,
            y:
                game.input.direction.y *
                game.input.direction.m *
                1.7 *
                velocityAdj
        };

        this.vel.x = (this.vel.x + v.x) / 2;
        this.vel.y = (this.vel.y + v.y) / 2;
    }

    fire() {
        Audio.playShotgun();

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

    draw(viewport) {
        let sprite = Sprite.player[Math.floor(game.frame / 30) % 2],
            blast;

        if (this.state === Behavior.ATTACK && this.frames >= 2) {
            sprite = Sprite.player_recoil;
            blast = Sprite.shotgun_blast[6 - this.frames];
        }

        //Sprite.drawViewportSprite(viewport, sprite, this.pos, game.camera.pos, this.facingAngle + C.R90);

        let hf = this.state === Behavior.RELOAD && !this.forcedReload ? 15 : 0;
        for (let i = Math.min(hf, history.length); i >= 0; i--) {
            let { u, v } = Sprite.viewportSprite2uv(
                viewport,
                sprite,
                this.history[i],
                game.camera.pos
            );

            viewport.ctx.save();
            viewport.ctx.globalAlpha = i === 0 ? 1 : 0.5;
            viewport.ctx.translate(u + sprite.anchor.x, v + sprite.anchor.y);
            viewport.ctx.rotate(this.facingAngle + C.R90);

            viewport.ctx.drawImage(
                sprite.img,
                -sprite.anchor.x,
                -sprite.anchor.y
            );
            if (blast) {
                viewport.ctx.drawImage(
                    blast.img,
                    3 - blast.anchor.x,
                    -20 - blast.anchor.y
                );
            }
            viewport.ctx.restore();
        }
    }
}
