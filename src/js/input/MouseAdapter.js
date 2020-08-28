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
    this.map[2]  = Input.Action.RELOAD;    // RMB

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

    window.addEventListener('click', event => {
      event.preventDefault();
    });

    window.addEventListener('contextmenu', event => {
      let k = this.map[event.button];
      if (k) this.held[k] = true;
      this.releaseRMBTick = 2;
      event.preventDefault();
    });

    return this;
  }

  update() {
    // Hacks: ideally we could use mousedown and mouseup for all clicks and preventDefault to
    // avoid opening the browser's context menu. This hasn't worked for me so far when clicking
    // on a canvas, so I need to use the context menu event to capture a right mouse click instead.
    //
    // We fake a down/up for RMB clicks, which means we can't determine how long the RMB is held
    // (but luckily we don't need to for this game).
    if (this.releaseRMBTick) {
      this.releaseRMBTick--;
      if (this.releaseRMBTick === 0) {
        this.held[Input.Action.RELOAD] = false;
        console.log('released');
      }
    }
  }

  reset() {
    this.pointer = undefined;
    for (let action of Object.values(Input.Action)) {
      this.held[action] = false;
    }
  }
}
