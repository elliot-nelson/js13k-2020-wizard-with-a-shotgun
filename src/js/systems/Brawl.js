'use strict';

import { Behavior } from './Behavior';
import { vectorAdd } from '../Util';
import { Player } from '../Player';
import { HealthChunkAnimation } from '../HealthChunkAnimation';
import { game } from '../Game';

/**
 * Brawl
 */
export const Brawl = {
    apply() {
        if (game.brawl) {
            if (game.brawl.plan.length === 0) {
                if (!game.brawl.enemies.find(enemy => !enemy.cull)) {
                    game.roomsCleared.unshift(game.brawl.room.roomNumber);
                    game.brawl = false;
                }
            } else {
                if (game.frame >= game.brawl.plan[0].frame) {
                    let spawn = game.activeBattle.plan.shift();
                    let monster = new Sculptor();
                    monster.pos = { x: spawn.x, y: spawn.y };
                    game.entities.push(monster);
                    game.activeBattle.enemies.push(monster);
                }
            }
        } else {
            let qr = xy2qr(game.player.pos);
            let room = this.maze.rooms[this.maze.maze[qr.r][qr.q]];

            if (
                room &&
                room.roomNumber >= 3 &&
                !this.roomsCleared.includes(room.roomNumber) &&
                room.w >= 3 &&
                room.h >= 4 &&
                qr.q > room.q &&
                qr.r > room.r &&
                qr.q < room.q + room.w - 1 &&
                qr.r < room.r + room.h - 1
            ) {
                game.screenshakes.push(new ScreenShake(25, 25, 25));
                this.activeBattle = {
                    room,
                    enemies: [],
                    start: this.frame,
                    plan: [
                        {
                            frame: this.frame + 10,
                            x:
                                Math.floor(Math.random() * (room.w * 32)) +
                                room.q * 32,
                            y:
                                Math.floor(Math.random() * (room.h * 32)) +
                                room.r * 32
                        },
                        {
                            frame: this.frame + 50,
                            x:
                                Math.floor(Math.random() * (room.w * 32)) +
                                room.q * 32,
                            y:
                                Math.floor(Math.random() * (room.h * 32)) +
                                room.r * 32
                        },
                        {
                            frame: this.frame + 90,
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
