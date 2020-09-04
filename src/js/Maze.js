'use strict';

import { game } from './Game';
import { Viewport } from './Viewport';
import { Sprite } from './Sprite';
import { WALL_TOP, WALL_RIGHT, WALL_BOTTOM, WALL_LEFT, OPEN_TOP, OPEN_RIGHT, OPEN_BOTTOM, OPEN_LEFT, DIALOG_START_A, DIALOG_START_B, DIALOG_HINT_1, DIALOG_HINT_2, DIALOG_HINT_3, R360 } from './Constants';

/**
 * Viewport
 *
 * Represents the game display (for us, a canvas).
 */
export const Maze = {
    draw() {
        let ctx = Viewport.ctx, maze = game.maze;
        console.log(ctx,maze);

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

                    console.log(maze.walls[r][q]);
                    if (maze.walls[r][q] & OPEN_TOP) {
                        console.log('otp');
                        ctx.drawImage(
                            //Sprite.battle_door[f].img,
                            Sprite.walls.img,
                            0, 0, 36, 4,
                            x - 2, y - 2, 36, 4
                        );
                    }

                    if (maze.walls[r][q] & OPEN_RIGHT) {
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
};
