'use strict';

import { Input } from './Input';
import { R0, R45, R90 } from '../Constants';


/**
 * KeyboardAdapter
 *
 * Maps keyboard inputs to game inputs.
 */
export const KeyboardAdapter = {
    init() {
        KeyboardAdapter.map = {
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
        KeyboardAdapter.arrowDirections = [
            { x:   R0, y:   R0, m: 0 },
            { x:   R0, y: -R90, m: 1 },
            { x:   R0, y:  R90, m: 1 },
            { x:   R0, y:   R0, m: 0 },
            { x: -R90, y:   R0, m: 1 },
            { x: -R45, y: -R45, m: 1 },
            { x: -R45, y:  R45, m: 1 },
            { x: -R90, y:   R0, m: 1 },
            { x:  R90, y:   R0, m: 1 },
            { x:  R45, y: -R45, m: 1 },
            { x:  R45, y:  R45, m: 1 },
            { x:  R90, y:   R0, m: 1 },
            { x:   R0, y:   R0, m: 0 },
            { x:   R0, y: -R90, m: 1 },
            { x:   R0, y:  R90, m: 1 },
            { x:   R0, y:   R0, m: 0 }
        ];

        KeyboardAdapter.held = [];

        window.addEventListener('keydown', event => {
            let k = KeyboardAdapter.map[event.code];
            // Debugging - key presses
            // console.log(event.key, event.keyCode, event.code, k);
            if (k) {
                KeyboardAdapter.held[k] = true;
            }
        });

        window.addEventListener('keyup', event => {
            let k = KeyboardAdapter.map[event.code];
            if (k) {
                KeyboardAdapter.held[k] = false;
            }
        });

        KeyboardAdapter.reset();
    },

    update() {
        // For keyboards, we want to convert the state of the various arrow keys being held down
        // into a directional vector. We use the browser's event to handle the held state of
        // the other action buttons, so we don't need to process them here.
        let state =
            (KeyboardAdapter.held[Input.Action.UP] ? 1 : 0) +
            (KeyboardAdapter.held[Input.Action.DOWN] ? 2 : 0) +
            (KeyboardAdapter.held[Input.Action.LEFT] ? 4 : 0) +
            (KeyboardAdapter.held[Input.Action.RIGHT] ? 8 : 0);

        KeyboardAdapter.direction = KeyboardAdapter.arrowDirections[state];
    },

    reset() {
        KeyboardAdapter.direction = KeyboardAdapter.arrowDirections[0];
        for (let action of Object.values(Input.Action)) {
            KeyboardAdapter.held[action] = false;
        }
    }
};
