'use strict';

import { Sprite } from './Sprite';
import { Input } from './input/Input';
import { MapLoader } from './MapLoader';
import { Text } from './Text';
import { Player } from './Player';
import { Monster } from './Monster';
import { Sculptor } from './Sculptor';
import { viewport } from './Viewport';
import { Constants as C } from './Constants';
import { uv2xy, xy2qr } from './Util';
import { Menu } from './Menu';

import { Audio } from './Audio';

import { Canvas } from './Canvas';

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
        viewport.init();

        this.input = new Input();
        await this.input.init();

        await Audio.init();

        this.maze = MapLoader.load();
        this.camera = { pos: { x: 1, y: 1 } };

        await Sprite.init();
        await Text.init();

        this.entities = [];

        this.dialogPending = {};
        this.dialogSeen = {};

        this.player = new Player();
        this.player.pos.x =
            (this.maze.rooms[1].q + Math.floor(this.maze.rooms[1].w / 2)) *
                C.TILE_WIDTH +
            C.TILE_WIDTH / 2;
        this.player.pos.y =
            (this.maze.rooms[1].r + Math.floor(this.maze.rooms[1].h / 2)) *
                C.TILE_WIDTH +
            C.TILE_WIDTH / 2;

        this.entities.push(this.player);

        this.roomsCleared = [];

        this.shadowCanvas = new Canvas(500, 500);
        this.shadowOffset = 0;

        this.screenshakes = [];

        /*

        await Assets.init();

        this.artifacts = [
            await Assets.grayscaleNoise(this.canvas.width, this.canvas.height),
            await Assets.grayscaleNoise(this.canvas.width, this.canvas.height),
            await Assets.grayscaleNoise(this.canvas.width, this.canvas.height)
        ];

        this.input = new Input();
        await this.input.init();

        this.player = new Player();

        this.hud = new Hud();

        this.particles = [];
        this.screenshakes = [];
        this.menuStack = [];

        this.monsters = [];

        // Create, but do not initialize, the audio object. The audio object will be
        // initialized as soon as possible by the first user input event, to meet
        // requirements of the browser.
        this.audio = new Audio();

        this.score = 0;

        this.hive = new Hive();

        */
    }

    start() {
        this.frame = 0;

        this.started = true;
        this.update();
        this.started = false;

        this.dialogPending[C.DIALOG_START_A] = true;
        this.dialogPending[C.DIALOG_START_B] = true;
        this.dialogPending[C.DIALOG_HINT_1] = true;
        this.dialogPending[C.DIALOG_HINT_2] = true;
        this.dialogPending[C.DIALOG_HINT_3] = true;

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
        viewport.resize();
        this.update();
        this.draw(viewport.ctx);
        window.requestAnimationFrame(() => this.onFrame(currentms));
    }

    update() {
        // Pull in frame by frame button pushes / keypresses / mouse clicks
        this.input.update();

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

    spawnEnemy() {
        let enemies = this.entities.filter(entity => entity instanceof Monster);
        if (enemies.length < 4 && Math.random() < 0.1) {
            let q =
                this.maze.rooms[1][0].q +
                this.maze.rand(0, this.maze.rooms[1][0].width);
            let r =
                this.maze.rooms[1][0].r +
                this.maze.rand(0, this.maze.rooms[1][0].height);
            let monster = new Monster();
            monster.pos = qr2xy({ q, r });
            this.entities.push(monster);
        }
    }

    draw(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(viewport.scale, viewport.scale);

        let shakeX = 0;
        let shakeY = 0;
        this.screenshakes.forEach(shake => {
            shakeX += shake.x;
            shakeY += shake.y;
        });
        ctx.translate(shakeX, shakeY);

        ctx.fillStyle = 'rgba(20,20,20,1)';
        ctx.fillRect(0, 0, viewport.width, viewport.height);

        for (let entity of this.entities) {
            if (entity.z < 0) entity.draw(viewport);
        }

        this.drawMaze(ctx, this.maze);

        for (let entity of this.entities) {
            if (entity.z > 0 || !entity.z) entity.draw(viewport);
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
        gradient.addColorStop(0.3, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(' + klack + ',0,0,0.9)');
        this.shadowCanvas.ctx.fillStyle = gradient;
        this.shadowCanvas.ctx.fillRect(0, 0, 500, 500);

        if (game.frame % 6 === 0) this.shadowOffset = (Math.random() * 10) | 0;
        viewport.ctx.drawImage(
            this.shadowCanvas.canvas,
            0,
            0,
            500,
            500,
            0 - this.shadowOffset,
            0 - this.shadowOffset,
            viewport.width + this.shadowOffset * 2,
            viewport.height + this.shadowOffset * 2
        );

        Hud.draw(viewport);

        //let ky = this.frame;
        //Text.drawText(ctx, 'FIGHT', ky * 10, 100, 4, Text.default, Text.shadow);

        for (let entity of this.entities) {
            if (entity.z && entity.z > 100) entity.draw(viewport);
        }

        /*
        ctx.fillStyle = 'rgba(150, 128, 128, 1)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.shadow.ctx.globalCompositeOperation = 'copy';
        //this.shadow.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.shadow.ctx.fillStyle = 'rgba(0, 0, 0, 0.99)';
        this.shadow.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.shadow.ctx.globalCompositeOperation = 'destination-out';
        let grd = this.shadow.ctx.createRadialGradient(game.player.x, game.player.y, 0, game.player.x, game.player.y, 200);
        grd.addColorStop(0, "rgba(0, 0, 0, 1)");
        grd.addColorStop(0.5, "rgba(0, 0, 0, 0.95)");
        grd.addColorStop(1, "rgba(0, 0, 0, 0)");
        this.shadow.ctx.fillStyle = grd;
        this.shadow.ctx.beginPath();
        this.shadow.ctx.arc(game.player.x, game.player.y, 200, 0, 2 * Math.PI);
        this.shadow.ctx.fill();

        for (let particle of this.particles.filter(p => p instanceof PortalParticle)) {
            let r = (particle as PortalParticle).effectiveRadius();
            this.shadow.ctx.globalCompositeOperation = 'destination-out';
            let grd = this.shadow.ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, r);
            grd.addColorStop(0, "rgba(0, 0, 0, 0.7)");
            grd.addColorStop(1, "rgba(0, 0, 0, 0)");
            this.shadow.ctx.fillStyle = grd;
            this.shadow.ctx.beginPath();
            this.shadow.ctx.arc(particle.x, particle.y, r, 0, 2 * Math.PI);
            this.shadow.ctx.fill();
        }

        this.shadow.ctx.globalCompositeOperation = 'source-atop';
        for (let monster of this.monsters) {
            this.shadow.ctx.beginPath();
            this.shadow.ctx.arc(monster.x, monster.y, 200, 0, 2 * Math.PI);
        }

        /*
          we don't even use bloodplanes (splatter terrain) anymore because i just
          render all of them as particles
        ctx.globalAlpha = 1 - this.bloodplanes[0][1] / this.bloodplanes[0][2];
        ctx.globalAlpha = 0.9;
        ctx.drawImage(this.bloodplanes[0][0].canvas, 0, 0);
        ctx.globalAlpha = 1 - this.bloodplanes[1][1] / this.bloodplanes[1][2];
        ctx.drawImage(this.bloodplanes[1][0].canvas, 0, 0);
        ctx.globalAlpha = 1 - this.bloodplanes[2][1] / this.bloodplanes[2][2];
        ctx.drawImage(this.bloodplanes[2][0].canvas, 0, 0);
        ctx.globalAlpha = 1;
        ctx.save();
        let shakeX = 0, shakeY = 0;
        this.screenshakes.forEach(shake => {
            shakeX += shake.x;
            shakeY += shake.y;
        });
        ctx.translate(shakeX, shakeY);

        // low-hanging fruit here (pre-render the map since it never changes)
        for (let i = 0; i < 16; i++) {
            for (let j = 0; j < 10; j++) {
                let k = ((i * i * 13) + j * 17) % 9;
                Sprite.drawSprite(ctx, Sprite.tiles[k], i * 32 - 16, j * 32 - 8);
            }
        }

        for (let particle of this.particles) if (!particle.foreground && !game.superFired) particle.draw(ctx);

        this.player.draw(ctx);

        //Text.renderText(ctx, 250, 120, 20, 'THE ELEPHANTS');
        //Text.renderText(ctx, 100, 200, 64, 'AB0123456789');
        //Text.renderText(ctx, 100, 150, 30, 'AB0123456789');

        for (let monster of this.monsters) monster.draw(ctx);

  //      var bubble = ctx.createLinearGradient(
        // Let's add blue noise?
        /*for (let i = 100; i < 300; i += 5) {
            for(let j = 100; j < 120; j += 5) {
                let [x, y] = [Math.random() * 5, Math.random() * 5];
                ctx.fillStyle = 'rgba(0,0,0,0.5)';
                ctx.fillRect(i+Math.floor(x),j+Math.floor(y),1,1);
            }

        for (let particle of this.particles) if (particle.foreground) particle.draw(ctx);

        ctx.drawImage(this.shadow.canvas, 0, 0);
        let noiseLoop = Math.floor(this.frame / 8) % 3;
        ctx.globalAlpha = 0.06;
        ctx.drawImage(this.artifacts[noiseLoop].canvas, 0, 0);
        ctx.globalAlpha = 1;

        this.hud.draw(ctx);
        this.hive.draw(ctx);

        ctx.restore();

        /*
        if (this.frame % HEARTBEAT === 0 || (this.frame - 1) % HEARTBEAT === 0 || (this.frame - 2) % HEARTBEAT === 0) {
            ctx.fillStyle = 'rgba(255, 255, 30, 0.3)';
            ctx.fillRect(100, 0, 100, 10);
        */

        Menu.draw(viewport);

        //        drawParagraph(ctx, text, u, v, w, h, font = this.default, scale = 1) {

        //if (this.dialog) this.dialog.draw(viewport);

        //this.shadowCanvas.ctx.fillStyle = 'blue';
        //this.shadowCanvas.ctx.fillRect(0, 0, 500, 300);
        /*this.shadowCanvas.ctx.setTransform(1, 0, 0, 1, 0, 0);

        let scaleX, scaleY, invScaleX, invScaleY, grad;
        scaleX = invScaleX = 1;
        scaleY = viewport.height / viewport.width;
        invScaleY = viewport.width / viewport.height;
        //grad = this.shadowCanvas.ctx.createRadialGradient(250, 150 * invScaleY, 0, 250, 150 * invScaleY, 250);
        grad = this.shadowCanvas.ctx.createRadialGradient(250, 150, 0, 250, 150, 250);
        let klack = (Math.sin(game.frame / 60) * 128 + 128) | 0;
        grad.addColorStop(0.1, 'rgba(0,0,0,0)');
        grad.addColorStop(0.9, 'rgba(' + klack + ',0,0,1)');

        this.shadowCanvas.ctx.fillStyle = grad;
        this.shadowCanvas.ctx.fillRect(0, 0, 500, 300);*/
    }

    drawMaze(ctx, maze) {
        let offset = {
            x: viewport.center.u - this.camera.pos.x,
            y: viewport.center.v - this.camera.pos.y
        };

        let r1 = 0, r2 = maze.h, q1 = 0, q2 = maze.w;
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
                if (!sprite)
                    throw new Error(`${q},${r} tile ${maze.tiles[r][q]}`);
                ctx.drawImage(sprite.img, x, y);
            }
        }

        for (let r = r1; r < r2; r++) {
            for (let q = q1; q < q2; q++) {
                let x = q * 32 + offset.x,
                    y = r * 32 + offset.y;
                if (x < -50 || y < -50 || x > 500 || y > 500) continue;

                if (maze.walls[r][q] & C.WALL_TOP) {
                    ctx.drawImage(
                        Sprite.walls.img,
                        5,
                        5,
                        36,
                        4,
                        x - 2,
                        y - 2,
                        36,
                        4
                    );
                }

                if (maze.walls[r][q] & C.WALL_RIGHT) {
                    ctx.drawImage(
                        Sprite.walls.img,
                        37,
                        5,
                        4,
                        36,
                        x + 30,
                        y - 2,
                        4,
                        36
                    );
                }

                if (maze.walls[r][q] & C.WALL_BOTTOM) {
                    ctx.drawImage(
                        Sprite.walls.img,
                        5,
                        37,
                        36,
                        4,
                        x - 2,
                        y + 30,
                        36,
                        4
                    );
                }

                if (maze.walls[r][q] & C.WALL_LEFT) {
                    ctx.drawImage(
                        Sprite.walls.img,
                        5,
                        5,
                        4,
                        36,
                        x - 2,
                        y - 2,
                        4,
                        36
                    );
                }

                if (this.brawl) {
                    let f = (this.frame / 8) % 3 | 0;

                    if (maze.walls[r][q] & C.OPEN_TOP) {
                        ctx.drawImage(
                            Sprite.battle_door[f].img,
                            5,
                            0,
                            36,
                            9,
                            x - 2,
                            y - 7,
                            36,
                            9
                        );
                    }

                    if (maze.walls[r][q] & C.OPEN_RIGHT) {
                        ctx.drawImage(
                            Sprite.battle_door[f].img,
                            37,
                            5,
                            9,
                            41,
                            x + 30,
                            y - 2,
                            9,
                            41
                        );
                    }

                    if (maze.walls[r][q] & C.OPEN_BOTTOM) {
                        ctx.drawImage(
                            Sprite.battle_door[f].img,
                            5,
                            37,
                            36,
                            9,
                            x - 2,
                            y + 30,
                            36,
                            9
                        );
                    }

                    if (maze.walls[r][q] & C.OPEN_LEFT) {
                        ctx.drawImage(
                            Sprite.battle_door[f].img,
                            0,
                            5,
                            9,
                            41,
                            x - 7,
                            y - 2,
                            9,
                            41
                        );
                    }
                }
            }
        }

        // old wall logic
        //sprite = Sprite.walls[maze.tiles[r][q] >> 4];
        //if (sprite) ctx.drawImage(sprite.img, x, y);

        //if (this.maze.flowhome[r][q] < 100)
        //Text.drawText(ctx, String(this.maze.flowhome[r][q]), x, y);

        // commented for screenshots:
        //Text.drawText(ctx, String(maze.tiles[r][q] >> 4), x, y);

        //ctx.fillRect(q * 4 - this.camera.pos.x + this.center.pixel.u, r * 4 - this.camera.pos.y + this.center.pixel.v, 4, 4);
    }
}

export const game = new Game();
