'use strict';

import { Behavior } from './Behavior';
import { vectorAdd } from '../Util';
import { Player } from '../Player';
import { HealthChunkAnimation } from '../HealthChunkAnimation';
import { game } from '../Game';
import { xy2qr, vectorBetween } from '../Util';
import { ScreenShake } from '../ScreenShake';
import { Sculptor } from '../Sculptor';
import { Stabguts } from '../Stabguts';
import { SpawnAnimation } from '../SpawnAnimation';

const SpawnPatterns = [
    [
        { enemy: Stabguts, frame: 0 },
        { enemy: Stabguts, frame: 30 },
        { enemy: Stabguts, frame: 60 },
        { enemy: Stabguts, frame: 90 },
        { enemy: Stabguts, frame: 120 },
        { enemy: Stabguts, frame: 150 },
        { enemy: Stabguts, frame: 180 },
        /*{ enemy: Sculptor, frame: 10 },
        { enemy: Sculptor, frame: 50 },
        { enemy: Sculptor, frame: 90 },
        { enemy: Sculptor, frame: 180 },
        { enemy: Sculptor, frame: 180 },
        { enemy: Sculptor, frame: 180 },
        { enemy: Sculptor, frame: 180 }*/
    ]
];

/**
 * Brawl
 */
export const Brawl = {
    apply() {
        game.roomsCleared = game.roomsCleared || [];

        if (game.brawl) {
            let livingEnemies = game.brawl.enemies.filter(enemy => !enemy.cull).length;

            if (game.brawl.plan.length === 0) {
                if (livingEnemies === 0) {
                    game.roomsCleared.unshift(game.brawl.room.roomNumber);
                    game.brawl = false;
                }
            } else {
                let plan = game.brawl.plan[0];
                if (game.frame >= game.brawl.start + plan.frame) {
                    if (Brawl.spawn(plan)) {
                        game.brawl.plan.shift();
                    }
                } else if (livingEnemies === 0) {
                    // If nothing is alive, hasten the next enemy
                    plan.frame -= 10;
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
                game.screenshakes.push(new ScreenShake(20, 20, 20));
                game.brawl = {
                    room,
                    enemies: [],
                    start: game.frame,
                    plan: SpawnPatterns[room.pattern].map(plan => ({ ...plan }))
                };
            }
        }
    },

    spawn(plan) {
        let pos = {
            x: (Math.random() * (game.brawl.room.w * 32 - 32) | 0) + game.brawl.room.q * 32 + 16,
            y: (Math.random() * (game.brawl.room.h * 32 - 32) | 0) + game.brawl.room.r * 32 + 16
        };

        let v = vectorBetween(game.player.pos, pos);
        if (v.m > 48) {
            let enemy = new plan.enemy(pos);
            game.entities.push(enemy);
            game.brawl.enemies.push(enemy);
            game.entities.push(new SpawnAnimation(pos));
            return enemy;
        }
    }
};
