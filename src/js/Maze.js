'use strict';

import { game } from './Game';
import { Viewport } from './Viewport';
import { Sprite } from './Sprite';
import { WALL_TOP, WALL_RIGHT, WALL_BOTTOM, WALL_LEFT, OPEN_TOP, OPEN_RIGHT, OPEN_BOTTOM, OPEN_LEFT, DIALOG_START_A, DIALOG_START_B, DIALOG_HINT_1, DIALOG_HINT_2, DIALOG_HINT_3, R360 } from './Constants';
import { rgba } from './Util';

/**
 * Viewport
 *
 * Represents the game display (for us, a canvas).
 */
export const Maze = {
    draw() {
        let ctx = Viewport.ctx, maze = game.maze;

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

            // During brawl, everything outside the room is hidden
            Viewport.ctx.fillStyle = rgba(20, 20, 20, 1);
            Viewport.ctx.fillRect(0, 0, Viewport.width, Viewport.height);
        } else {
            // Render wall tiles across the entire background
            Viewport.ctx.drawImage(Sprite.tilebg.img, -16 - game.camera.pos.x % 32, -8 - game.camera.pos.y % 32);
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

                if (game.brawl) {
                    if (maze.walls[r][q] & OPEN_TOP) {
                        ctx.drawImage(
                            Sprite.gates.img,
                            0, 0, 36, 4,
                            x - 2, y - 2, 36, 4
                        );
                    }

                    if (maze.walls[r][q] & OPEN_RIGHT) {
                        ctx.drawImage(
                            Sprite.gates.img,
                            32, 0, 4, 36,
                            x + 30, y - 2, 4, 36
                        );
                    }

                    if (maze.walls[r][q] & OPEN_BOTTOM) {
                        ctx.drawImage(
                            Sprite.gates.img,
                            0, 32, 36, 4,
                            x - 2, y + 30, 36, 4
                        );
                    }

                    if (maze.walls[r][q] & OPEN_LEFT) {
                        ctx.drawImage(
                            Sprite.gates.img,
                            0, 0, 4, 36,
                            x - 2, y - 2, 4, 36
                        );
                    }
                }
            }
        }
    }
};
