'use strict';

import { Behavior } from './Behavior';
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
    //return;
    if (!game.dialog && game.frame > 60) {
      for (let key of Object.keys(Dialog.details)) {
        if (game.dialogPending[key] && !game.dialogSeen[key]) {
          if (!Dialog.details[key].required || game.dialogSeen[Dialog.details[key].required]) {
            entities.push(new Dialog(key));
            return;
          }
        }
      }
    }
  }
}
