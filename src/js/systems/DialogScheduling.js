'use strict';

import { Behavior } from './Behavior';
import { Geometry as G } from '../Geometry';
import { Player } from '../Player';
import { HealthChunkAnimation } from '../HealthChunkAnimation';
import { game } from '../Game';
import { Constants as C } from '../Constants';
import { Dialog } from '../Dialog';

/**
 * Damage
 */
export const DialogScheduling = {
  apply(entities) {
    if (!game.dialog && game.frame > 60) {
      if (!game.flags[C.FLAG_DIALOG_START_A]) {
        entities.push(new Dialog(C.DIALOG_START_A, C.FLAG_DIALOG_START_A, true));
      }
      if (game.flags[C.FLAG_DIALOG_START_A] && !game.flags[C.FLAG_DIALOG_START_B]) {
        entities.push(new Dialog(C.DIALOG_START_B, C.FLAG_DIALOG_START_B, true));
      }
      if (game.flags[C.FLAG_DIALOG_START_B] && !game.flags[C.FLAG_DIALOG_HINT_1]) {
        entities.push(new Dialog(C.DIALOG_HINT_1, C.FLAG_DIALOG_HINT_1));
      }
    }
  }
};
