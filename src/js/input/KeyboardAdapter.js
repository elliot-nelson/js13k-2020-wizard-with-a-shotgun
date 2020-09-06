'use strict';

import { Input } from './Input';

// A few quick constants (0*, 45*, 90*)
const A00 = 0;
const A45 = 0.7071067811865475;
const A90 = 1;

/**
 * KeyboardAdapter
 *
 * Maps keyboard inputs to game inputs.
 */
export class KeyboardAdapter {
    constructor(handler) {
        this.handler = handler;

        this.map = {
            KeyW:        Input.Action.UP,
            KeyA:        Input.Action.LEFT,
            KeyS:        Input.Action.DOWN,
            KeyD:        Input.Action.RIGHT,
            ArrowUp:     Input.Action.UP,
            ArrowLeft:   Input.Action.LEFT,
            ArrowDown:   Input.Action.DOWN,
            ArrowRight:  Input.Action.RIGHT,
            Escape:      Input.Action.MENU
        };

        /*
        this.map[88] = Input.Action.ATTACK; // [X]
        this.map[90] = Input.Action.DEFLECT; // [Z]
        this.map[67] = Input.Action.DODGE; // [C]
        this.map[32] = Input.Action.SUPER; // [SPACEBAR]
        this.map[38] = Input.Action.UP; // [UpArrow]
        this.map[40] = Input.Action.DOWN; // [DownArrow]
        this.map[37] = Input.Action.LEFT; // [LeftArrow]
        this.map[39] = Input.Action.RIGHT; // [RightArrow]
        this.map[87] = Input.Action.UP; // [W]
        this.map[83] = Input.Action.DOWN; // [S]
        this.map[65] = Input.Action.LEFT; // [A]
        this.map[68] = Input.Action.RIGHT; // [D]
        this.map[27] = Input.Action.MENU; // [ESC]
        this.map[77] = Input.Action.MUTE; // [M]
        this.map[70] = Input.Action.FREEZE; // [F]
        this.map[80] = Input.Action.FREEZE; // [P]
        */

        // For keyboard, we support 8-point movement (S, E, SE, etc.)
        this.arrowDirections = [
            { x: A00, y: A00, m: 0 },
            { x: A00, y: -A90, m: 1 },
            { x: A00, y: A90, m: 1 },
            { x: A00, y: A00, m: 0 },
            { x: -A90, y: A00, m: 1 },
            { x: -A45, y: -A45, m: 1 },
            { x: -A45, y: A45, m: 1 },
            { x: -A90, y: A00, m: 1 },
            { x: A90, y: A00, m: 1 },
            { x: A45, y: -A45, m: 1 },
            { x: A45, y: A45, m: 1 },
            { x: A90, y: A00, m: 1 },
            { x: A00, y: A00, m: 0 },
            { x: A00, y: -A90, m: 1 },
            { x: A00, y: A90, m: 1 },
            { x: A00, y: A00, m: 0 }
        ];

        this.held = [];

        this.reset();
    }

    async init() {
        window.addEventListener('keydown', event => {
            let k = this.map[event.code];
            console.log(event.key, event.keyCode, event.code, k);
            console.log(this.map);
            if (k) {
                this.held[k] = true;
            }
        });

        window.addEventListener('keyup', event => {
            let k = this.map[event.code];
            if (k) {
                this.held[k] = false;
            }
        });
    }

    update() {
        // For keyboards, we want to convert the state of the various arrow keys being held down
        // into a directional vector. We use the browser's event to handle the held state of
        // the other action buttons, so we don't need to process them here.
        let state =
            (this.held[Input.Action.UP] ? 1 : 0) +
            (this.held[Input.Action.DOWN] ? 2 : 0) +
            (this.held[Input.Action.LEFT] ? 4 : 0) +
            (this.held[Input.Action.RIGHT] ? 8 : 0);

        this.direction = this.arrowDirections[state];
    }

    reset() {
        this.direction = this.arrowDirections[0];
        for (let action of Object.values(Input.Action)) {
            this.held[action] = false;
        }
    }
}
