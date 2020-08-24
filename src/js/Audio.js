'use strict';

import { zzfxG, zzfxP, zzfx } from './zzfx';

export const Audio = {
    async init() {
        // Note: terser has a bug that prevents it from handling a spread array with holes.
        // That is: `f(...[,,3])` generates invalid javascript `f(,,3)`.
        // We can work around that bug with a little helper shim.
        let cache = sound => zzfxG(...sound);
        Audio.shotgun = cache([,.01,140,.01,.02,.45,4,2.42,.1,-0.1,,,,1.2,,.3,.04,.8,.02]);

    },

    playShotgun() {
        zzfxP(Audio.shotgun);
/*
        zzfx(...[,,925,.04,.3,.6,1,.3,,6.27,-184,.09,.17]); // Game Over
zzfx(...[,,537,.02,.02,.22,1,1.59,-6.98,4.97]); // Heart
zzfx(...[1.5,.8,270,,.1,,1,1.5,,,,,,,,.1,.01]); // Piano
zzfx(...[,,129,.01,,.15,,,,,,,,5]); // Drum
*/
    }
};
