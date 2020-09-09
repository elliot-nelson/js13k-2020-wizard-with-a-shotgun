'use strict';

import { game } from '../Game';
import { Dialog } from '../Dialog';

/**
 * DialogScheduling
 */
export const DialogScheduling = {
    apply() {
        if (!game.dialog && !game.brawl && game.frame > 20) {
            for (let key of Object.keys(Dialog.details)) {
                if (game.dialogPending[key] && !game.dialogSeen[key]) {
                    if (
                        !Dialog.details[key].required ||
                        game.dialogSeen[Dialog.details[key].required]
                    ) {
                        game.entities.push(new Dialog(key));
                        return;
                    }
                }
            }
        }
    }
};
