'use strict';

import { game } from '../Game';
import { Dialog } from '../Dialog';

/**
 * DialogScheduling
 */
export const DialogScheduling = {
    apply() {
        if (!game.dialog && !game.brawl && !game.victory) {
            for (let idx = 0; idx < Dialog.details.length; idx++) {
                if (game.dialogPending[idx] && !game.dialogSeen[idx]) {
                    game.entities.push(new Dialog(idx));
                    return;
                }
            }
        }
    }
};
