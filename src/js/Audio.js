'use strict';

import { zzfx, zzfxP, zzfxX } from './lib/zzfx';
import { zzfxM } from './lib/zzfxm';
import { ObliqueMystique } from './songs/ObliqueMystique';


export const Audio = {
    init() {
        Audio.readyToPlay = false;

        Audio.ctx = zzfxX;
        Audio.gain_ = Audio.ctx.createGain();
        Audio.gain_.connect(Audio.ctx.destination);
        zzfx.destination_ = Audio.gain_;

        Audio.shotgun = [,0.01,140,0.01,0.02,0.45,4,2.42,0.1,-0.1,,,,1.2,,0.3,0.04,0.8,0.02];
        Audio.page = [,,1233,,.01,.2,1,1.43,,,539,.1,,,,,,.51,.03,.01];
        Audio.shellReload = [,,68,0.01,,0.14,1,1.53,7.5,0.1,50,0.02,-0.01,-0.2,0.1,0.2,,0.47,0.01];
        Audio.damage = [,,391,,.19,.01,2,.54,-4,20,,,,,,,.02,.9];
        Audio.alarm = [,,970,.12,.25,.35,,.39,8.1,,10,.1,.2,,.1,,,.6,.09,.13];
        Audio.song = zzfxM(...ObliqueMystique);

        // Save our background music in os13k, for fun!
        localStorage['OS13kMusic,Wizard with a Shotgun - Oblique Mystique'] = JSON.stringify(ObliqueMystique);
    },

    update() {
        if (!Audio.readyToPlay) return;

        if (!Audio.musicPlaying) {
            Audio.bgmusicnode = zzfxP(...Audio.song);
            Audio.bgmusicnode.loop = true;
            Audio.musicPlaying = true;
        }
    },

    play(sound) {
        if (!Audio.readyToPlay) return;
        zzfx(...sound);
    },

    // It's important we do pausing and unpausing as specific events and not in general update(),
    // because update() is triggered by the animation frame trigger which does not run if the
    // page is not visible. (So, if you want the music to fade in the background, for example,
    // that's not helpful if it won't work because you aren't looking at the page!)

    pause() {
        Audio.gain_.gain.linearRampToValueAtTime(0, Audio.ctx.currentTime + 1);
    },

    unpause() {
        Audio.gain_.gain.linearRampToValueAtTime(1, Audio.ctx.currentTime + 1);
    }
};
