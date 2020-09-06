'use strict';

import { zzfx, zzfxP } from './lib/zzfx';
import { zzfxM } from './lib/zzfxm';
import { ObliqueButNotObtuse } from './songs/ObliqueButNotObtuse';

export const Audio = {
    async init() {
        if (this.initialized) return;

        Audio.shotgun = [,0.01,140,0.01,0.02,0.45,4,2.42,0.1,-0.1,,,,1.2,,0.3,0.04,0.8,0.02];
        Audio.page = [,,1233,,.01,.2,1,1.43,,,539,.1,,,,,,.51,.03,.01];
        Audio.shellReload = [,,68,0.01,,0.14,1,1.53,7.5,0.1,50,0.02,-0.01,-0.2,0.1,0.2,,0.47,0.01];
        Audio.song = zzfxM(...ObliqueButNotObtuse);

        this.initialized = true;
    },

    update() {
        if (!this.initialized) return;

        if (!this.musicPlaying) {
            this.bgmusicnode = zzfxP(...Audio.song);
            this.bgmusicnode.loop = true;
            this.musicPlaying = true;
        }
    },

    play(sound) {
        if (!this.initialized) return;
        zzfx(...sound);
    }
};
