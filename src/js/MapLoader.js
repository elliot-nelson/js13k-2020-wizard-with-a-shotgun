'use strict';

import { WALL_TOP, WALL_RIGHT, WALL_BOTTOM, WALL_LEFT, OPEN_TOP, OPEN_RIGHT, OPEN_BOTTOM, OPEN_LEFT } from './Constants';
import { array2d } from './Util';
import { Map } from './Map-gen';

export const MapLoader = {
    createRoomLookup(rooms) {
        return rooms.reduce((hash, room) => {
            hash[room.roomNumber] = room;
            return hash;
        }, {});
    },

    createWalls(maze, rooms) {
        let walls = array2d(maze[0].length, maze.length, () => 0);
        for (let r = 0; r < walls.length; r++) {
            for (let q = 0; q < walls[0].length; q++) {
                if (maze[r][q]) {
                    let room = rooms[maze[r][q]];

                    walls[r][q] =
                        (maze[r - 1][q] ? 0 : WALL_TOP) |
                        (maze[r][q + 1] ? 0 : WALL_RIGHT) |
                        (maze[r + 1][q] ? 0 : WALL_BOTTOM) |
                        (maze[r][q - 1] ? 0 : WALL_LEFT);

                    if (room) {
                        walls[r][q] |=
                            (maze[r - 1][q] && r === room.r ? OPEN_TOP : 0) |
                            (maze[r][q + 1] && (q === room.q + room.w - 1)
                                ? OPEN_RIGHT
                                : 0) |
                            (maze[r + 1][q] && (r === room.r + room.h - 1)
                                ? OPEN_BOTTOM
                                : 0) |
                            (maze[r][q - 1] && q === room.q ? OPEN_LEFT : 0);
                    }
                }
            }
        }
        return walls;
    },

    loadMap() {
        let maze = array2d(Map.w, Map.h, () => 0);
        let rooms = Map.rooms.map(room => ({
            q: room[0],
            r: room[1],
            w: room[2],
            h: room[3],
            roomNumber: room[4],
            pattern: room[5]
        }));

        let ptr = 0;
        for (let next of Map.tunnels) {
            ptr += next;
            maze[(ptr / Map.w) | 0][ptr % Map.w] = 3;
        }

        for (let room of rooms) {
            for (let r = 0; r < room.h; r++) {
                for (let q = 0; q < room.w; q++) {
                    maze[room.r + r][room.q + q] = room.roomNumber;
                }
            }
        }

        let roomLookup = this.createRoomLookup(rooms);

        return {
            maze,
            walls: this.createWalls(maze, roomLookup),
            rooms: roomLookup,
            w: Map.w,
            h: Map.h
        };
    }
};
