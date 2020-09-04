'use strict';

import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { MapLoader } from './MapLoader';
import { Text } from './Text';
import { Player } from './Player';
import { Viewport } from './Viewport';
import { WALL_TOP, WALL_RIGHT, WALL_BOTTOM, WALL_LEFT, OPEN_TOP, OPEN_RIGHT, OPEN_BOTTOM, OPEN_LEFT, DIALOG_START_A, DIALOG_START_B, DIALOG_HINT_1, DIALOG_HINT_2, DIALOG_HINT_3 } from './Constants';
import { uv2xy, xy2qr, angle2vector, rgba, createCanvas } from './Util';
import { Menu } from './Menu';
import { Audio } from './Audio';
import { Behavior } from './systems/Behavior';
import { Brawl } from './systems/Brawl';
import { Movement } from './systems/Movement';
import { Damage } from './systems/Damage';
import { DialogScheduling } from './systems/DialogScheduling';
import { Hud } from './Hud';
import { StarfieldParticle } from './StarfieldParticle';
import { ScreenShake } from './ScreenShake';

/**
 * Game state.
 */
export class Game {
    async init() {
        await Viewport.init();
        await Sprite.init();
        await Input.init();
        await Audio.init();

        this.maze = MapLoader.load();
        this.camera = { pos: { x: 1, y: 1 } };
        this.entities = [];
        this.dialogPending = {};
        this.dialogSeen = {};
        this.roomsCleared = [];
        this.shadowCanvas = createCanvas(500, 500);
        this.shadowOffset = 0;
        this.screenshakes = [];
        this.player = new Player();
        this.entities.push(this.player);
    }

    start() {
        this.frame = 0;

        this.started = true;
        this.update();
        this.started = false;

        this.dialogPending[DIALOG_START_A] =
        this.dialogPending[DIALOG_START_B] =
        this.dialogPending[DIALOG_HINT_1] =
        this.dialogPending[DIALOG_HINT_2] =
        this.dialogPending[DIALOG_HINT_3] = false;

        /*
        this.menuStack.push(new IntroMenuA({
            onClose: () => {
                this.menuStack.push(new IntroMenuB({}));
            }
        }));*/

        //this.framems = performance.now();
        window.requestAnimationFrame(() => this.onFrame(1));
        //this.frame = 0;
    }

    onFrame(currentms) {
        this.frame++;
        Viewport.resize();
        this.update();
        this.draw(Viewport.ctx);
        window.requestAnimationFrame(() => this.onFrame(currentms));
    }

    update() {
        // Pull in frame by frame button pushes / keypresses / mouse clicks
        Input.update();

        // Behavior (AI, player input, etc.)
        Behavior.apply(this.entities);

        // Apply any queued damage
        Damage.apply(this.entities);

        // Movement (apply entity velocities to position)
        Movement.apply(this.entities);

        // Dialog scheduling
        DialogScheduling.apply(this.entities);

        Brawl.apply();

        // Culling (typically set when an entity dies)
        this.entities = this.entities.filter(entity => !entity.cull);

        // camera logic! where does it go! (an entity perhaps?)
        let diff = {
            x: this.player.pos.x - this.camera.pos.x,
            y: this.player.pos.y - this.camera.pos.y
        };
        this.camera.pos.x += diff.x * 0.2;
        this.camera.pos.y += diff.y * 0.2;

        // Starfield particle
        this.entities.push(new StarfieldParticle());

        // Tick screenshakes and cull finished screenshakes
        this.screenshakes = this.screenshakes.filter(screenshake =>
            screenshake.update()
        );
    }

    draw() {
        let ctx = Viewport.ctx;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(Viewport.scale, Viewport.scale);

        let shakeX = 0;
        let shakeY = 0;
        this.screenshakes.forEach(shake => {
            shakeX += shake.x;
            shakeY += shake.y;
        });
        ctx.translate(shakeX, shakeY);

        ctx.fillStyle = rgba(20, 20, 20, 1);
        ctx.fillRect(0, 0, Viewport.width, Viewport.height);

        for (let entity of this.entities) {
            if (entity.z < 0) entity.draw();
        }

        this.drawMaze(ctx, this.maze);

        for (let entity of this.entities) {
            if (entity.z > 0 || !entity.z) entity.draw();
        }

        // Black gradient
        let klack = (Math.sin(game.frame / 30) * 128 + 128) | 0;
        klack = 0;
        this.shadowCanvas.ctx.globalCompositeOperation = 'copy';
        let gradient = this.shadowCanvas.ctx.createRadialGradient(
            250,
            250,
            0,
            250,
            250,
            250
        );
        gradient.addColorStop(0.3, rgba(0, 0, 0, 0));
        gradient.addColorStop(1, rgba(klack, 0, 0, 0.9));
        this.shadowCanvas.ctx.fillStyle = gradient;
        this.shadowCanvas.ctx.fillRect(0, 0, 500, 500);

        if (game.frame % 6 === 0) this.shadowOffset = (Math.random() * 10) | 0;
        Viewport.ctx.drawImage(
            this.shadowCanvas.canvas,
            0,
            0,
            500,
            500,
            0 - this.shadowOffset,
            0 - this.shadowOffset,
            Viewport.width + this.shadowOffset * 2,
            Viewport.height + this.shadowOffset * 2
        );

        Hud.draw();

        for (let entity of this.entities) {
            if (entity.z && entity.z > 100) entity.draw();
        }

        Menu.draw();
/*
        ctx.strokeStyle = rgba(200, 50, 200, 1);
        ctx.beginPath();
        ctx.arc(250, 150, 50, 0, Math.PI * 2);
        ctx.stroke();

        let p = angle2vector((2 * Math.PI) / 3 + Math.PI / 2);
        let [u, v] = [p.x * 40 + 250, p.y * 40 + 150];
        ctx.arc(u, v, 10, 0, Math.PI * 2);
        ctx.stroke();

        p = angle2vector((4 * Math.PI) / 3 + Math.PI / 2);
        [u, v] = [p.x * 40 + 250, p.y * 40 + 150];
        ctx.arc(u, v, 10, 0, Math.PI * 2);
        ctx.stroke();

        p = angle2vector((6 * Math.PI) / 3 + Math.PI / 2);
        [u, v] = [p.x * 40 + 250, p.y * 40 + 150];
        ctx.arc(u, v, 10, 0, Math.PI * 2);
        ctx.stroke();
        */
    }

    drawMaze(ctx, maze) {
        let offset = {
            x: Viewport.center.u - game.camera.pos.x,
            y: Viewport.center.v - game.camera.pos.y
        };

        let r1 = 0,
            r2 = maze.h,
            q1 = 0,
            q2 = maze.w;
        if (game.brawl) {
            r1 = game.brawl.room.r;
            r2 = r1 + game.brawl.room.h;
            q1 = game.brawl.room.q;
            q2 = q1 + game.brawl.room.w;
        }

        for (let r = r1; r < r2; r++) {
            for (let q = q1; q < q2; q++) {
                let x = q * 32 + offset.x,
                    y = r * 32 + offset.y;
                if (x < -50 || y < -50 || x > 500 || y > 500) continue;

                let sprite = Sprite.tiles[maze.tiles[r][q] & 0b1111];
                ctx.drawImage(sprite.img, x, y);
            }
        }

        for (let r = r1; r < r2; r++) {
            for (let q = q1; q < q2; q++) {
                let x = q * 32 + offset.x,
                    y = r * 32 + offset.y;
                if (x < -50 || y < -50 || x > 500 || y > 500) continue;

                if (maze.walls[r][q] & WALL_TOP) {
                    ctx.drawImage(
                        Sprite.walls.img,
                        0, 0, 36, 4,
                        x - 2, y - 2, 36, 4
                    );
                }

                if (maze.walls[r][q] & WALL_RIGHT) {
                    ctx.drawImage(
                        Sprite.walls.img,
                        32, 0, 4, 36,
                        x + 30, y - 2, 4, 36
                    );
                }

                if (maze.walls[r][q] & WALL_BOTTOM) {
                    ctx.drawImage(
                        Sprite.walls.img,
                        0, 32, 36, 4,
                        x - 2, y + 30, 36, 4
                    );
                }

                if (maze.walls[r][q] & WALL_LEFT) {
                    ctx.drawImage(
                        Sprite.walls.img,
                        0, 0, 4, 36,
                        x - 2, y - 2, 4, 36
                    );
                }

                if (this.brawl) {
                    let f = (this.frame / 8) % 3 | 0;

                    if (maze.walls[r][q] & OPEN_TOP) {
                        console.log('OTP');
                        ctx.drawImage(
                            Sprite.battle_door[f].img,
                            0, 0, 36, 4,
                            x - 2, y - 2, 36, 4
                        );
                    }

                    if (maze.walls[r][q] & OPEN_RIGHT) {
                        console.log('RIGHT');
                        ctx.drawImage(
                            Sprite.battle_door[f].img,
                            32, 0, 4, 36,
                            x + 30, y - 2, 4, 36
                        );
                    }

                    if (maze.walls[r][q] & OPEN_BOTTOM) {
                        ctx.drawImage(
                            Sprite.battle_door[f].img,
                            0, 32, 36, 4,
                            x - 2, y + 30, 36, 4
                        );
                    }

                    if (maze.walls[r][q] & OPEN_LEFT) {
                        ctx.drawImage(
                            Sprite.battle_door[f].img,
                            0, 0, 4, 36,
                            x - 2, y - 2, 4, 36
                        );
                    }
                }
            }
        }
    }
}

export const game = new Game();
