/*import { Input } from './Input';
import { Player } from './Player';
import { ScreenShake } from './ScreenShake';
import { Hud } from './Hud';
import { Menu, PauseMenu, IntroMenuA, IntroMenuB, OutroMenu } from './Menu';
import { Audio } from './Audio';
import { Assets, Sprite, drawPoly } from './Assets';
import { Demon1 } from './Demon1';
import { Canvas } from './Canvas';
import { Particle, PortalParticle, SuperParticle } from './Particle';
import { Hive } from './Hive';
import { Point, intersectingPolygons, intersectingCircles, RAD, vectorFromAngle, distance } from './Geometry';
import { HEARTBEAT } from './Config';
import { Tween } from './Tween';
*/

import { Assets, Sprite } from './Assets';
import { Input } from './input/Input';
import { MazeGenerator } from './MazeGenerator';
import { Text } from './Text';
import { Player} from './Player';
import { Monster } from './Monster';
import { viewport } from './Viewport';
import { Constants as C } from './Constants';
import { Geometry as G } from './Geometry';
import { Menu } from './Menu';

import { Canvas} from './Canvas';

import { Behavior } from './systems/Behavior';
import { Movement } from './systems/Movement';
import { Damage } from './systems/Damage';

/**
 * Game state.
 */
export class Game {
    constructor() {
    }

    async init() {
        viewport.init();

        this.input = new Input();
        await this.input.init();

        //this.maze = MazeGenerator.generate("apples");
        //this.maze = MazeGenerator.generate("manhattan");
        this.maze = MazeGenerator.generate("arkham");
        this.camera = { pos: { x: 1, y: 1 } };

        await Assets.init();
        await Text.init();

        this.entities = [];

        this.player = new Player();
        console.log(this.maze.rooms);
        this.player.pos.x = (this.maze.rooms[1][0].q + Math.floor(this.maze.rooms[1][0].width / 2)) * C.TILE_WIDTH + C.TILE_WIDTH / 2;
        this.player.pos.y = (this.maze.rooms[1][0].r + Math.floor(this.maze.rooms[1][0].height / 2)) * C.TILE_WIDTH + C.TILE_WIDTH / 2;

        this.entities.push(this.player);

        this.roomsCleared = [];

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

        // Culling (typically set when an entity dies)
        this.entities = this.entities.filter(entity => !entity.cull);

        // camera logic! where does it go! (an entity perhaps?)
        let diff = {
            x: this.player.pos.x - this.camera.pos.x,
            y: this.player.pos.y - this.camera.pos.y
        };
        this.camera.pos.x += diff.x * 0.2;
        this.camera.pos.y += diff.y * 0.2;

        //this.spawnEnemy();

        if (!this.activeBattle && false) {
            let qr = G.xy2qr(game.player.pos);
            let room = this.maze.rooms[this.maze.maze[qr.r][qr.q]];
            if (room && room.length) room = room[0];

            if (room && !this.roomsCleared.includes(room.roomNumber) && room.width > 4 && room.height > 4 &&
                qr.q > room.q && qr.r > room.r && qr.q < room.q + room.width - 1 && qr.r < room.r + room.height - 1) {
                this.activeBattle = {
                    room,
                    enemies: [],
                    plan: [
                        {
                            frame: this.frame + 10,
                            x: Math.floor(Math.random() * (room.width * 32)) + room.q * 32,
                            y: Math.floor(Math.random() * (room.height * 32)) + room.r * 32,
                        },
                        {
                            frame: this.frame + 70,
                            x: Math.floor(Math.random() * (room.width * 32)) + room.q * 32,
                            y: Math.floor(Math.random() * (room.height * 32)) + room.r * 32,
                        }
                    ]
                };
                console.log("BATTLE STARTED", room);
            }
        }

        if (this.activeBattle) {
            if (this.activeBattle.plan.length === 0) {
                if (this.activeBattle.enemies.filter(enemy => !enemy.cull).length === 0) {
                    this.roomsCleared.unshift(this.activeBattle.room.roomNumber);
                    this.activeBattle = undefined;
                    console.log("BATTLE FINISHED", this.roomsClear);
                }
            } else {
                if (this.frame >= this.activeBattle.plan[0].frame) {
                    let spawn = this.activeBattle.plan.shift();
                    let monster = new Monster();
                    monster.pos = { x: spawn.x, y: spawn.y };
                    this.entities.push(monster);
                    this.activeBattle.enemies.push(monster);
                }
            }
        }
    }

    spawnEnemy() {
        let enemies = this.entities.filter(entity => entity instanceof Monster);
        if (enemies.length < 4 && Math.random() < 0.1) {
            let q = this.maze.rooms[1][0].q + this.maze.rand(0, this.maze.rooms[1][0].width);
            let r = this.maze.rooms[1][0].r + this.maze.rand(0, this.maze.rooms[1][0].height);
            let monster = new Monster();
            monster.pos = G.qr2xy({ q, r });
            this.entities.push(monster);
        }
    }

    draw(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(viewport.scale, viewport.scale);

        if (this.activeBattle) {
            ctx.fillStyle = 'rgba(128,20,20,1)';
            ctx.fillRect(0, 0, viewport.width, viewport.height);

            let t = this.frames / 60;
            let c = viewport.canvas;
            let x = viewport.ctx;
            let S = Math.sin;
            let C = Math.cos;
            let T = Math.tan;
            let R = (r,g,b,a) => `${r},${g},${b},${a}`;
            let i, w, p, Y, r;

            function u(t) {
                for(w=c.width&=i=8320;i--;u[i]=t?p<w?r%.7*(p+u[i-w]+u[i-w+1])&w-1:p:(~r-14&16)<<r*.6)p=u[i],x.fillRect(i%w,Y=68-i/w,1,p**.4/7-Y/w),r=i*t^i&Y
            }

            //u(t)
        } else {
            ctx.fillStyle = 'rgba(20,20,20,1)';
            ctx.fillRect(0, 0, viewport.width, viewport.height);
        }

        /*ctx.fillStyle = 'rgba(150, 128, 128, 1)';
        ctx.fillRect(10, 10, 100, 100);*/

        this.drawMaze(ctx, this.maze);

        for (let entity of this.entities) {
            entity.draw(viewport);
        }

        this.drawHud(ctx);

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
    }

    drawMaze(ctx, maze) {
        let offset = {
            x: viewport.center.u - this.camera.pos.x,
            y: viewport.center.v - this.camera.pos.y
        };

        let r1 = this.activeBattle ? this.activeBattle.room.r : 0,
            r2 = this.activeBattle ? this.activeBattle.room.r + this.activeBattle.room.height : maze.tiles.length,
            q1 = this.activeBattle ? this.activeBattle.room.q : 0,
            q2 = this.activeBattle ? this.activeBattle.room.q + this.activeBattle.room.width : maze.tiles[0].length;

        for (let r = r1; r < r2; r++) {
            for (let q = q1; q < q2; q++) {
                let x = q * 32 + offset.x, y = r * 32 + offset.y;
                if (x < -50 || y < -50 || x > 500 || y > 500) continue;

                let sprite = Sprite.tiles[maze.tiles[r][q] & 0b1111];
                if (!sprite) throw new Error(`${q},${r} tile ${maze.tiles[r][q]}`);
                ctx.drawImage(sprite.img, x, y);
            }
        }

        for (let r = r1; r < r2; r++) {
            for (let q = q1; q < q2; q++) {
                let x = q * 32 + offset.x, y = r * 32 + offset.y;
                if (x < -50 || y < -50 || x > 500 || y > 500) continue;

                if (maze.walls[r][q] & C.WALL_TOP) {
                    ctx.drawImage(Sprite.walls.img, 0, 0, 36, 4, x - 2, y - 2, 36, 4);
                }

                if (maze.walls[r][q] & C.WALL_RIGHT) {
                    ctx.drawImage(Sprite.walls.img, 32, 0, 4, 36, x + 30, y - 2, 4, 36);
                }

                if (maze.walls[r][q] & C.WALL_BOTTOM) {
                    ctx.drawImage(Sprite.walls.img, 0, 32, 36, 4, x - 2, y + 30, 36, 4);
                }

                if (maze.walls[r][q] & C.WALL_LEFT) {
                    ctx.drawImage(Sprite.walls.img, 0, 0, 4, 36, x - 2, y - 2, 4, 36);
                }

                if (maze.walls[r][q] & C.OPEN_TOP) {
                    ctx.drawImage(Sprite.laserwall[Math.floor(this.frame / 10) % 3].img, 0, 0, 5, 28, x, y, 5, 28);
                }

                if (maze.walls[r][q] & C.OPEN_RIGHT) {
                    ctx.drawImage(Sprite.laserwall[Math.floor(this.frame / 10) % 3].img, 0, 0, 5, 28, x, y, 5, 28);
                }

                if (maze.walls[r][q] & C.OPEN_BOTTOM) {
                    ctx.drawImage(Sprite.laserwall[Math.floor(this.frame / 10) % 3].img, 0, 0, 5, 28, x, y, 5, 28);
                }

                if (maze.walls[r][q] & C.OPEN_LEFT) {
                    ctx.drawImage(Sprite.laserwall[Math.floor(this.frame / 10) % 3].img, 0, 0, 5, 28, x - 2, y + 2, 5, 28);
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

    pointerXY() {
        if (!this.input.pointer) return;
        return this.uv2xy(this.input.pointer);
    }

    xy2uv(pos) {
        return {
            u: pos.x - this.camera.pos.x + viewport.center.u,
            v: pos.y - this.camera.pos.y + viewport.center.v
        };
    }

    uv2xy(pos) {
        return {
            x: pos.u - viewport.center.u + this.camera.pos.x,
            y: pos.v - viewport.center.v + this.camera.pos.y
        };
    }

    drawHud(ctx) {
        let hp = G.clamp(game.player.hp, 0, 100);
        ctx.drawImage(Sprite.hud_health_frame.img, 2, 2);
        ctx.drawImage(Sprite.hud_health_fill.img, 0, 0, hp + 8, 8, 2, 2, hp + 8, 8);

        let sprite = Sprite.hud_shells_full;
        for (let i = 0; i < game.player.shellsMax; i++) {
            if (i + 1 > game.player.shellsLeft) sprite = Sprite.hud_shells_empty;
            ctx.drawImage(sprite.img, 15 + 6 * i, 10);
        }

        ctx.drawImage(Sprite.page.img, viewport.width - 39, 10 - 1);
        Text.drawText(ctx, 'x302', viewport.width - 30, 10);

        Text.drawText(ctx, String(this.frame), viewport.width - 30, viewport.height - 28);

        Text.drawRightText(ctx, [viewport.scale, viewport.width, viewport.height].join(', '), viewport.width - 4, viewport.height - 18);
        let ptr = this.input.pointer;
        if (ptr) {
            Text.drawRightText(ctx, JSON.stringify(ptr), viewport.width - 4, viewport.height - 8);
            ctx.save();
            ctx.translate(ptr.u, ptr.v);
            ctx.rotate(this.frame / 72);
            ctx.drawImage(Sprite.hud_crosshair.img, -Sprite.hud_crosshair.anchor.x, -Sprite.hud_crosshair.anchor.y);
            ctx.restore();
            //Sprite.drawSprite(ctx, Sprite.hud_crosshair, ptr.u, ptr.v);
        }

        if (!this.grab) {
            let colors = [
                'rgba(20, 20, 20)',
                'rgba(20, 20, 20)',
                'rgba(32, 32, 32)',
                'rgba(32, 32, 32)',
                'rgba(64, 6, 6)',
                'rgba(64, 6, 6)',
                'rgba(128, 0, 0)',
                'rgba(158, 32, 32)'
            ];

            this.grab = new Canvas(100, 100);
            for (let i = 0; i < 100; i++) {
                for (let j = 0; j < 100; j++) {
                    let c = colors[Math.floor(Math.random() * colors.length)];
                    this.grab.ctx.fillStyle = c;
                    this.grab.ctx.fillRect(i, j, 1, 1);
                }
            }
            this.grab.ctx.globalOpacity = 0.1;
            this.grab.ctx.drawImage(this.grab.canvas, 0, 0, 50, 100, 1, 0, 50, 100);
            this.grab.ctx.drawImage(this.grab.canvas, 0, 0, 50, 100, 2, 0, 50, 100);
            this.grab.ctx.drawImage(this.grab.canvas, 0, 0, 50, 100, 3, 0, 50, 100);
        }
        let mark = this.frame % 100;
        //ctx.drawImage(this.grab.canvas, mark, 0, 100 - mark, 100, 50, 50, 100 - mark, 100);
        //ctx.drawImage(this.grab.canvas, 0, 0, mark, 100, 50 + 100 - mark, 50, mark, 100);
    }
}

export const game = new Game();
