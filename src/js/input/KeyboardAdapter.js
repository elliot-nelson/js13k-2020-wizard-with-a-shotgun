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

    init() {
        window.addEventListener('keydown', event => {
            let k = this.map[event.code];
            // Debugging - key presses
            // console.log(event.key, event.keyCode, event.code, k);
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
