'use strict';

import { Sprite } from './Assets';
import { Canvas } from './Canvas';

const C_WIDTH = 3;
const C_HEIGHT = 5;

// Very simple variable-width font implementation. The characters in the font strip
// are left-aligned in their 3x5 pixel boxes, so in order to have variable width,
// we just need to note the characters that AREN'T full width. Anything not in
// this list has full shift (3+1 = 4 pixels).
const C_SHIFT = {
    32: 3,          // Space
    44: 3,          // Comma
    46: 3,          // Period
    73: 2           // I
};

/**
 * Text
 *
 * Utilities for drawing text using in-game pixel font.
 */
export const Text = {
    async init() {
        this.default = Sprite.font.img;
        this.fire = this.recolor(this.default, ctx => {
            let gradient = ctx.createLinearGradient(0, 0, 0, this.default.height);
            gradient.addColorStop(0, 'rgba(240,134,51,1)');
            gradient.addColorStop(1, 'rgba(250,220,74,1)');
            return gradient;
        });
        this.shadow = this.recolor(this.default, 'rgba(240, 240, 255, 0.25)');
    },

    drawText(ctx, text, u, v, font = this.default, scale = 1) {
        text = text.toUpperCase();
        for (let idx = 0; idx < text.length; idx++) {
            let c = text.charCodeAt(idx);
            ctx.drawImage(
                font,
                (c - 32) * (C_WIDTH + 1), 0, C_WIDTH, C_HEIGHT,
                u, v, C_WIDTH * scale, C_HEIGHT * scale
            );
            u += (C_SHIFT[c] || (C_WIDTH + 1)) * scale;
        }
    },

    drawRightText(ctx, text, u, v, font = this.default, scale = 1) {
        text = text.toUpperCase();
        u -= this.measureWidth(text, scale);
        this.drawText(ctx, text, u, v, font, scale);
    },

    drawParagraph(ctx, text, u, v, w, h, font = this.default, scale = 1) {
        let cu = u, cv = v, phrases = text.toUpperCase().split(' ');

        for (let phrase of phrases) {
            let phraseWidth = this.measureWidth(phrase, scale);
            if (cu + phraseWidth - u > w) {
                cu = u;
                cv += (C_HEIGHT + 2) * scale;
            }
            this.drawText(ctx, phrase, cu, cv, font, scale);
            cu += phraseWidth + (C_SHIFT[32] || 4);
        }
    },

    measureWidth(text, scale) {
        return text.split('').reduce((sum, c) => sum + (C_SHIFT[c.charCodeAt(0)] || 4), 0) * scale;
    },

    recolor(font, color) {
        let canvas = new Canvas(font.width, font.height);
        canvas.ctx.fillStyle = typeof color === "function" ? color(canvas.ctx) : color;
        canvas.ctx.fillRect(0, 0, font.width, font.height);
        console.log(font.width, font.height, color, canvas);
        canvas.ctx.globalCompositeOperation = 'destination-in';
        canvas.ctx.drawImage(font, 0, 0);
        return canvas.canvas;
    },
};
