'use strict';

import { zzfx } from './zzfx';

export const Audio = {
    async init() {
        // prettier-ignore
        Audio.shotgun = [,0.01,140,0.01,0.02,0.45,4,2.42,0.1,-0.1,,,,1.2,,0.3,0.04,0.8,0.02];

        // prettier-ignore
        Audio.page = [,,1233,,.01,.2,1,1.43,,,539,.1,,,,,,.51,.03,.01];

        // prettier-ignore
        Audio.shellReload = [,,68,0.01,,0.14,1,1.53,7.5,0.1,50,0.02,-0.01,-0.2,0.1,0.2,,0.47,0.01];
    },

    play(cachedAudio) {
        zzfx(...cachedAudio);
    }
};
