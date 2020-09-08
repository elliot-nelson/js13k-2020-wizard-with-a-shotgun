'use strict';

import { Behavior } from './Behavior';
import { vectorAdd } from '../Util';
import { Player } from '../Player';
import { HealthChunkAnimation } from '../HealthChunkAnimation';
import { game } from '../Game';
import { xy2qr, vectorBetween } from '../Util';
import { ScreenShake } from '../ScreenShake';
import { Stabguts } from '../Stabguts';
import { Spindoctor } from '../Spindoctor';
import { SpawnAnimation } from '../SpawnAnimation';
import { Audio } from '../Audio';

const SpawnPatterns = [
    [
        [Stabguts, 0, 60, 120]
    ],
    [
        [Spindoctor, 0, 30, 60]
    ],
    [
        [Stabguts, 0, 30, 60, 90, 100, 110, 180, 200]
    ],
    [
        [Stabguts, 0, 10, 20, 180, 200,],
        [Spindoctor, 90, 100, 110, 240, 250, 260, 270, 280],
    ],
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
                if (game.frame >= game.brawl.start + plan[1]) {
                    if (Brawl.spawn(plan)) {
                        game.brawl.plan.shift();
                    }
                } else if (livingEnemies === 0) {
                    // If nothing is alive, hasten the next enemy
                    plan[1] -= 10;
                }

            }
        } else {
            let qr = xy2qr(game.player.pos);
            let room = game.maze.rooms[game.maze.maze[qr.r][qr.q]];
            if (
                room &&
                room.roomNumber >= 5 &&
                !game.roomsCleared.includes(room.roomNumber) &&
                qr.q > room.q &&
                qr.r > room.r &&
                qr.q < room.q + room.w - 1 &&
                qr.r < room.r + room.h - 1
            ) {
                room.pattern = 1;
                game.screenshakes.push(new ScreenShake(20, 20, 20));
                game.brawl = {
                    room,
                    enemies: [],
                    start: game.frame,
                    plan: Brawl.expandPattern(SpawnPatterns[room.pattern])
                };
                Audio.play(Audio.alarm);
            }
        }
    },

    expandPattern(pattern) {
        let plan = [];
        for (let entry of pattern) {
            let enemy = entry[0];
            for (let i = 1; i < entry.length; i++) {
                plan.push([enemy, entry[i]]);
            }
        }
        return plan;
    },

    spawn(plan) {
        let pos = {
            x: (Math.random() * (game.brawl.room.w * 32 - 32) | 0) + game.brawl.room.q * 32 + 16,
            y: (Math.random() * (game.brawl.room.h * 32 - 32) | 0) + game.brawl.room.r * 32 + 16
        };

        let v = vectorBetween(game.player.pos, pos);
        if (v.m > 48) {
            let enemy = new plan[0](pos);
            game.entities.push(enemy);
            game.brawl.enemies.push(enemy);
            game.entities.push(new SpawnAnimation(pos));
            return enemy;
        }
    }
};
