'use strict';

import { zzfx, zzfxP, zzfxX } from './lib/zzfx';
import { zzfxM } from './lib/zzfxm';
import { ObliqueMystique } from './songs/ObliqueMystique';

export const Audio = {
    async init() {
        this.readyToPlay = false;
        this.musicPlaying = true;

        this.ctx = zzfxX;
        this.gain = this.ctx.createGain();
        this.gain.connect(this.ctx.destination);
        zzfx.destination = this.gain;

        Audio.shotgun = [,0.01,140,0.01,0.02,0.45,4,2.42,0.1,-0.1,,,,1.2,,0.3,0.04,0.8,0.02];
        Audio.page = [,,1233,,.01,.2,1,1.43,,,539,.1,,,,,,.51,.03,.01];
        Audio.shellReload = [,,68,0.01,,0.14,1,1.53,7.5,0.1,50,0.02,-0.01,-0.2,0.1,0.2,,0.47,0.01];
        Audio.song = zzfxM(...ObliqueMystique);
    },

    update() {
        if (!this.readyToPlay) return;

        if (!this.musicPlaying) {
            this.bgmusicnode = zzfxP(...Audio.song);
            this.bgmusicnode.loop = true;
            this.musicPlaying = true;
        }
    },

    play(sound) {
        if (!this.readyToPlay) return;
        zzfx(...sound);
    },

    // It's important we do pausing and unpausing as specific events and not in general update(),
    // because update() is triggered by the animation frame trigger which does not run if the
    // page is not visible. (So, if you want the music to fade in the background, for example,
    // that's not helpful if it won't work because you aren't looking at the page!)

    pause() {
        this.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2.5);
    },

    unpause() {
        this.gain.gain.linearRampToValueAtTime(1, this.ctx.currentTime + 2.5);
    }
};
