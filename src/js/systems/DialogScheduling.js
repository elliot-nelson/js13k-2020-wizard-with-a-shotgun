'use strict';

import { game } from '../Game';
import { Dialog } from '../Dialog';

/**
 * DialogScheduling
 */
export const DialogScheduling = {
    apply() {
        if (!game.dialog && !game.brawl && game.frame > 20) {
            for (let dialog of Dialog.details) {
                if (game.dialogPending[dialog.flag] && !game.dialogSeen[dialog.flag]) {
                    game.entities.push(new Dialog(dialog.flag));
                    return;
                }
            }
        }
    }
};
