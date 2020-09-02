'use strict';

import { Behavior } from './Behavior';
import { vectorAdd } from '../Util';
import { Player } from '../Player';
import { HealthChunkAnimation } from '../HealthChunkAnimation';
import { game } from '../Game';
import { xy2qr } from '../Util';
import { ScreenShake } from '../ScreenShake';
import { Sculptor } from '../Sculptor';

/**
 * Brawl
 */
export const Brawl = {
    apply() {
        game.roomsCleared = game.roomsCleared || [];

        if (game.brawl) {
            if (game.brawl.plan.length === 0) {
                if (!game.brawl.enemies.find(enemy => !enemy.cull)) {
                    game.roomsCleared.unshift(game.brawl.room.roomNumber);
                    game.brawl = false;
                }
            } else {
                if (game.frame >= game.brawl.plan[0].frame) {
                    let spawn = game.brawl.plan.shift();
                    let monster = new Sculptor();
                    monster.pos = { x: spawn.x, y: spawn.y };
                    game.entities.push(monster);
                    game.brawl.enemies.push(monster);
                }
            }
        } else {
            let qr = xy2qr(game.player.pos);
            let room = game.maze.rooms[game.maze.maze[qr.r][qr.q]];

            if (
                room &&
                room.roomNumber >= 3 &&
                !game.roomsCleared.includes(room.roomNumber) &&
                room.w >= 3 &&
                room.h >= 4 &&
                qr.q > room.q &&
                qr.r > room.r &&
                qr.q < room.q + room.w - 1 &&
                qr.r < room.r + room.h - 1
            ) {
                game.screenshakes.push(new ScreenShake(25, 25, 25));
                game.brawl = {
                    room,
                    enemies: [],
                    start: game.frame,
                    plan: [
                        {
                            frame: game.frame + 10,
                            x:
                                Math.floor(Math.random() * (room.w * 32)) +
                                room.q * 32,
                            y:
                                Math.floor(Math.random() * (room.h * 32)) +
                                room.r * 32
                        },
                        {
                            frame: game.frame + 50,
                            x:
                                Math.floor(Math.random() * (room.w * 32)) +
                                room.q * 32,
                            y:
                                Math.floor(Math.random() * (room.h * 32)) +
                                room.r * 32
                        },
                        {
                            frame: game.frame + 90,
                            x:
                                Math.floor(Math.random() * (room.w * 32)) +
                                room.q * 32,
                            y:
                                Math.floor(Math.random() * (room.h * 32)) +
                                room.r * 32
                        }
                    ]
                };
            }
        }
    }
};
