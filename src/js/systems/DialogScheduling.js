'use strict';

import { game } from '../Game';
import { Dialog } from '../Dialog';

/**
 * DialogScheduling
 */
export const DialogScheduling = {
    apply(entities) {
        if (!game.dialog && game.frame > 60) {
            for (let key of Object.keys(Dialog.details)) {
                if (game.dialogPending[key] && !game.dialogSeen[key]) {
                    if (
                        !Dialog.details[key].required ||
                        game.dialogSeen[Dialog.details[key].required]
                    ) {
                        entities.push(new Dialog(key));
                        return;
                    }
                }
            }
        }
    }
};
