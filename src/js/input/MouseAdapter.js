'use strict';

import { Input } from './Input';
import { viewport } from '../Viewport';

/**
 * MouseAdapter
 *
 * Maps mouse inputs to game inputs.
 */
export class MouseAdapter {
  constructor(handler) {
    this.handler = handler;

    // Key Mapping:      ACTION            // Input
    this.map = [];
    this.map[0]  = Input.Action.ATTACK;    // LMB

    this.held = [];

    this.reset();
  }

  async init() {
    window.addEventListener('mousemove', event => {
      if (!this.pointer) this.pointer = {};
      //this.handlers['mousemove'](event.movementX, event.movementY, event.clientX, event.clientY);
      this.pointer.u = Math.floor((event.clientX * viewport.width) / viewport.clientWidth);
      this.pointer.v = Math.floor((event.clientY * viewport.height) / viewport.clientHeight);
    });

    window.addEventListener('mouseout', () => {
      this.pointer = undefined;
    });

    window.addEventListener('mousedown', event => {
      let k = this.map[event.button];
      if (k) this.held[k] = true;
    });

    window.addEventListener('mouseup', event => {
      let k = this.map[event.button];
      if (k) this.held[k] = false;
    });

    return this;
  }

  update() {
  }

  reset() {
    this.pointer = undefined;
    for (let action of Object.values(Input.Action)) {
      this.held[action] = false;
    }
  }
}
