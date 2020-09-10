'use strict';

import { GAME_WIDTH, GAME_HEIGHT } from './Constants';

/**
 * Viewport
 *
 * Represents the game display (for us, a canvas).
 */
export const Viewport = {
    init() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resize(true);
    },

    // Resize the canvas to give us approximately our desired game display size.
    //
    // Rather than attempt to explain it, here's a concrete example:
    //
    //     we start with a desired game dimension:   480x270px
    //          get the actual browser dimensions:  1309x468px
    //          factor in the display's DPI ratio:  2618x936px
    //         now calculate the horizontal scale:       5.45x
    //                     and the vertical scale:       3.46x
    //            our new offical game scaling is:        5.4x
    //       and our official viewport dimensions:   484x173px
    //
    // This approach emphasizes correct aspect ratio and maintains full-window rendering, at
    // the potential cost of limiting visibility of the game itself in either the X or Y axis.
    // If you use this approach, make sure your GUI can "float" (otherwise there may be whole
    // UI elements the player cannot see!).
    resize(force) {
        let dpi = window.devicePixelRatio;
        let width = this.canvas.clientWidth;
        let height = this.canvas.clientHeight;
        let dpiWidth = width * dpi;
        let dpiHeight = height * dpi;

        if (
            force ||
            this.canvas.width !== dpiWidth ||
            this.canvas.height !== dpiHeight
        ) {
            this.canvas.width = dpiWidth;
            this.canvas.height = dpiHeight;

            this.scale = ((Math.max(dpiWidth / GAME_WIDTH, dpiHeight / GAME_HEIGHT) * 10) | 0) / 10;
            this.width = Math.ceil(this.canvas.width / this.scale);
            this.height = Math.ceil(this.canvas.height / this.scale);
            this.center = {
                u: (this.width / 2) | 0,
                v: (this.height / 2) | 0
            };
            this.clientWidth = width;
            this.clientHeight = height;

            // Note: smoothing flag gets reset on every resize by some browsers, which is why
            // we do it here.
            this.ctx.imageSmoothingEnabled = false;
        }

        // We do this every frame, not just on resize, due to browser sometimes "forgetting".
        Viewport.canvas.style.cursor = 'none';
    }
};
