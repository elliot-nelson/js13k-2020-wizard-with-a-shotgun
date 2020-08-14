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

import { Behavior } from './systems/Behavior';
import { Movement } from './systems/Movement';

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

        this.maze = MazeGenerator.generate("apples");
        this.camera = { pos: { x: 1, y: 1 } };

        await Assets.init();
        await Text.init();

        this.entities = [];

        this.player = new Player();
        console.log(this.maze.rooms);
        this.player.pos.x = this.maze.rooms[1][0].q * C.TILE_WIDTH + C.TILE_WIDTH / 2;
        this.player.pos.y = this.maze.rooms[1][0].r * C.TILE_WIDTH + C.TILE_WIDTH / 2;

        this.entities.push(this.player);

        let monster = new Monster();
        monster.pos.x = 11 * 32 + 16;
        monster.pos.y = 11 * 32 + 16;
        this.entities.push(monster);

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

        // Movement (apply entity velocity to position)
        Movement.apply(this.entities);

        // camera logic! where does it go! (an entity perhaps?)
        let diff = {
            x: this.player.pos.x - this.camera.pos.x,
            y: this.player.pos.y - this.camera.pos.y
        };
        this.camera.pos.x += diff.x * 0.3;
        this.camera.pos.y += diff.y * 0.3;

        // Culling Step
        this.entities = this.entities.filter(entity => !entity.cull);
    }

    draw(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(viewport.scale, viewport.scale);

        ctx.fillStyle = 'rgba(48,32,48,1)';
        ctx.fillRect(0, 0, viewport.width, viewport.height);

        /*ctx.fillStyle = 'rgba(150, 128, 128, 1)';
        ctx.fillRect(10, 10, 100, 100);*/

        this.drawMaze(ctx, this.maze);

        ctx.fillStyle = 'white';
        ctx.font = '8px serif';
        ctx.fillText([viewport.scale,viewport.width,viewport.height].join(', '), 10, 10);

        /*
        Text.drawParagraph(ctx,
            "Hold down fire button to decrease spread and increase range." +
            " Most critical hits, when used, will go up 175%.",
            121, 50, 225, 100, Text.shadow, 1);
        Text.drawParagraph(ctx,
            "Hold down fire button to decrease spread and increase range." +
            " Most critical hits, when used, will go up 175%.",
            120, 50, 225, 100, Text.fire, 1);
            */

        Sprite.drawSprite(ctx, Sprite.demon_walk, 50, 50);

        let ptr = this.input.pointer;
        if (ptr) {
            Text.drawText(ctx, JSON.stringify(ptr), 20, 20);
            ctx.fillStyle = 'rgba(255, 120, 120, 1)';
            ctx.fillRect(ptr.u - 1, ptr.v - 1, 3, 3);
        }

        for (let entity of this.entities) {
            entity.draw(viewport);
        }

        // TODO
        // this.trace(viewport);

        // x

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
        console.log(Sprite.walls);
        for (let r = 0; r < maze.tiles.length; r++) {
            for (let q = 0; q < maze.tiles[r].length; q++) {
                let x = q * 32 + offset.x, y = r * 32 + offset.y;
                if (x < -50 || y < -50 || x > 500 || y > 500) continue;

                let sprite = Sprite.tiles[maze.tiles[r][q] & 0b1111];
                if (!sprite) throw new Error(`${q},${r} tile ${maze.tiles[r][q]}`);
                ctx.drawImage(sprite.img, x, y);

                sprite = Sprite.walls[maze.tiles[r][q] >> 4];
                if (sprite) ctx.drawImage(sprite.img, x, y);

                //if (this.maze.flowhome[r][q] < 100)
                //Text.drawText(ctx, String(this.maze.flowhome[r][q]), x, y);
                Text.drawText(ctx, String(maze.tiles[r][q] >> 4), x, y);

                //ctx.fillRect(q * 4 - this.camera.pos.x + this.center.pixel.u, r * 4 - this.camera.pos.y + this.center.pixel.v, 4, 4);
            }
        }
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

    trace(viewport) {
        if (!this.input.pointer) return;
        let p = this.player;
        for (let e of this.entities) {
            if (p === e) continue;
            viewport.ctx.beginPath();
            viewport.ctx.strokeStyle = 'red';
            viewport.ctx.moveTo(viewport.center.u - this.camera.pos.x + p.pos.x,
                viewport.center.v - this.camera.pos.y + p.pos.y);
            viewport.ctx.lineTo(this.input.pointer.u, this.input.pointer.v);
            viewport.ctx.stroke();

            this.raytrace(p.pos, this.pointerXY());
        }
    }

    // https://www.genericgamedev.com/general/shooting-rays-through-tilemaps/
    raytrace(p1, p2) {
        let redgreen = 'green';

        for (let { q, r } of G.tilesHitBetween(p1, p2)) {
            let offset = {
                x: viewport.center.u - this.camera.pos.x,
                y: viewport.center.v - this.camera.pos.y
            };
            if (!game.maze.maze[r][q]) redgreen = 'red';
            let highlight = redgreen === 'red' ? 'rgba(255, 128, 128, 0.5)' : 'rgba(128, 255, 128, 0.5)';
            viewport.ctx.fillStyle = highlight;
            viewport.ctx.strokeStyle = highlight;
            viewport.ctx.fillRect(q * 32 + offset.x, r * 32 + offset.y, 32, 32);
            viewport.ctx.strokeRect(q * 32 + offset.x, r * 32 + offset.y, 32, 32);
            if (redgreen === 'red') break;
        }
    }
}

export const game = new Game();
