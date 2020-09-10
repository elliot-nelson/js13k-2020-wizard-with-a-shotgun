'use strict';

import { game } from '../Game';
import { R360, TILE_SIZE, ROOM_ENDING } from '../Constants';
import { xy2qr, vectorBetween, vectorAdd, angle2vector, rgba, roomCenter } from '../Util';
import { Player } from '../Player';
import { HealthChunkAnimation } from '../HealthChunkAnimation';
import { ScreenShake } from '../ScreenShake';
import { Stabguts } from '../Stabguts';
import { Spindoctor } from '../Spindoctor';
import { SpawnAnimation } from '../SpawnAnimation';
import { DEAD } from './Behavior';

/**
 * Victory
 */
export const Victory = {
    perform() {
        if (game.player.pages >= 404 && !game.victory) {
            Victory.frame = 0;
            game.victory = true;
            game.player.pos = roomCenter(game.maze.rooms[ROOM_ENDING]);
            game.brawl = false;
            for (let entity of game.entities) {
                if (entity.enemy) entity.state = DEAD;
            }
        } else if (game.victory) {
            Victory.frame++;

            if (Victory.frame === 10) {
                game.entities.push(new SpawnAnimation(game.player.pos));
                game.screenshakes.push(new ScreenShake(20, 20, 90));
            }

            let enemyCount = game.entities.filter(entity => entity.enemy).length;
            if (Victory.frame % 30 === 0 && enemyCount < 25) {
                let pos = vectorAdd(game.player.pos, angle2vector(Math.random() * R360, 48));
                let enemyType = [Stabguts, Stabguts, Spindoctor][Math.random() * 3 | 0];
                let enemy = new enemyType(pos);
                game.entities.push(enemy);
                game.entities.push(new SpawnAnimation(pos));
            }
        }
    }
};
