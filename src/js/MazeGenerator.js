'use strict';

// https://journal.stuffwithstuff.com/2014/12/21/rooms-and-mazes/

import { Constants as C } from './Constants';
import { Geometry as G } from './Geometry';
import { Map } from './Map-gen';

// Maze Generator - TODO
//
//
export const MazeGenerator = {
    createRoomLookup(rooms) {
        return rooms.reduce((hash, room) => {
            hash[room.roomNumber] = room;
            return hash;
        }, {});
    },

    createWalls(maze, rooms) {
        let walls = G.array2d(maze[0].length, maze.length, 0);
        console.log(maze[0].length, maze.length, "fook");
        for (let r = 0; r < walls.length; r++) {
            for (let q = 0; q < walls[0].length; q++) {
                if (maze[r][q]) {
                    let room = rooms[maze[r][q]];

                    console.log(maze[18][5]);

                    console.log(r,q,room,maze[r+1]);
                    console.log(walls[r]);
                    console.log(maze[r-1][q]);
                    console.log(maze[r+1][q]);
                    console.log(maze[r][q -1]);
                    console.log(maze[r][q +1]);
                    walls[r][q] = (maze[r - 1][q] ? 0 : C.WALL_TOP) |
                                  (maze[r][q + 1] ? 0 : C.WALL_RIGHT) |
                                  (maze[r + 1][q] ? 0 : C.WALL_BOTTOM) |
                                  (maze[r][q - 1] ? 0 : C.WALL_LEFT);

                    if (room) {
                        walls[r][q] |= (maze[r - 1][q] && r === room.r ? C.OPEN_TOP : 0) |
                                       (maze[r][q + 1] && q === room.q + room.width - 1 ? C.OPEN_RIGHT : 0) |
                                       (maze[r + 1][q] && r === room.r + room.height - 1 ? C.OPEN_BOTTOM : 0) |
                                       (maze[r][q - 1] && q === room.q ? C.OPEN_LEFT : 0);
                    }
                }
            }
        }
        return walls;
    },

    createTiles(maze, rand) {
        let tiles = G.array2d(maze[0].length, maze.length, () => {
            return (rand() < 0.1 ? C.TILE_WALL2 : C.TILE_WALL1);
        });
        for (let r = 0; r < tiles.length; r++) {
            for (let q = 0; q < tiles[0].length; q++) {
                if (maze[r][q]) {
                    tiles[r][q] = C.TILE_FLOOR1;
                }
            }
        }
        return tiles;
    },

    generate() {
        let maze = G.array2d(Map.w, Map.h, 0);

        for (let tunnel of Map.tunnels) {
            maze[tunnel[1]][tunnel[0]] = 2;
        }

        for (let room of Map.rooms) {
            for (let r = 0; r < room.h; r++) {
                for (let q = 0; q < room.w; q++) {
                    maze[room.r + r][room.q + q] = room.roomNumber;
                }
            }
        }

        let roomLookup = this.createRoomLookup(Map.rooms);
        console.log(roomLookup);

        return {
            maze,
            walls: this.createWalls(maze, roomLookup),
            tiles: this.createTiles(maze, Math.random),
            rooms: roomLookup
        };
    }
};
