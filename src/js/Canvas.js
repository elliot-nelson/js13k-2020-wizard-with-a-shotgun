'use strict';

/**
 * This helper class encapsulates creating temporary off-screen canvases. Off-screen
 * canvases are great tools for building patterns, image masks, and other components
 * that we'll use to draw things on the primary canvas.
 */
export class Canvas {
  constructor(width, height) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');
  }
}
