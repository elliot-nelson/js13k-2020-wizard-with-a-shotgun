'use strict';

// https://journal.stuffwithstuff.com/2014/12/21/rooms-and-mazes/

import { Constants as C } from './Constants';
import { Geometry as G } from './Geometry';
import { Random } from './Random';

const CROSS = [
    { q: 0, r: 0 },
    { q: 0, r: -1 },
    { q: 0, r: 1 },
    { q: -1, r: 0 },
    { q: 1, r: 0 }
];

const CARDINALS = [
    { q: 0, r: -1 },
    { q: 0, r: 1 },
    { q: -1, r: 0 },
    { q: 1, r: 0 }
];

// Maze Generator - TODO
//
//
export const MazeGenerator = {
    openCrossCells(maze, q, r) {
        return CROSS.filter(dir => {
            let [cq, cr] = [q + dir.q, r + dir.r];
            return cr >= 0 && cr < maze.length && cq >= 0 && cq < maze[0].length && !maze[cr][cq];
        });
    },

    attemptRoomPlacement(maze, rand, bounds, width, height, roomNumber) {
        let q = rand(0, (bounds[1].q - width) / 2) * 2 + 1;
        let r = rand(0, (bounds[1].r - height) / 2) * 2 + 1;
        let found = undefined;

        //
        // TUNEABLE
        //
        // You can never "touch" the spawn room (Room #1). If you touch another room,
        // there's a 9% chance for each attempt to allow the room to be built, potentially
        // overlapping/intersecting, or even completely eclipsing the previous room
        // if this room is larger.
        //
        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                if (maze[r+j][q+i]) roomNumber = found = maze[r+j][q+i];
                if (maze[r+j][q+i]===1) return;
            }
        }
        if (found && rand() > 0.01) return;

        for (let j = 0; j < height; j++) {
            for (let i = 0; i < width; i++) {
                maze[r+j][q+i] = roomNumber;
            }
        }

        return { q, r, width, height, roomNumber };
    },

    carveMaze(maze, rand, startQ, startR, roomNumber) {
        let cells = [{ q: startQ, r: startR }];
        maze[startR][startQ] = roomNumber;

        while (cells.length > 0) {
            //
            // TUNEABLE
            //
            // When carving, we can attempt to carve off any cell in our collected list. For
            // this game, we choose 75% to keep carving off the last cell we carved (windy passage),
            // and 25% to carve somewhere else (branch). If we choose to branch, that's the
            // new windy passage, leaving the old one for later.
            //
            let idx = rand() < 0.25 ? rand(0, cells.length) : cells.length - 1;
            let cell = cells[idx];
            if (idx !== cells.length - 1) {
                cells.splice(idx, 1);
                cells.push(cell);
            }

            let possible = CARDINALS.filter(dir => {
                return MazeGenerator.openCrossCells(maze, cell.q + dir.q, cell.r + dir.r).length === 4;
            });
/*
            let possible = CARDINALS.filter(dir => {
                console.log(cell.r + dir.r, cell.q + dir.q);
                if (cell.r + dir.r < 0 || cell.r + dir.r >= maze.length || cell.q + dir.q < 0 || cell.q + dir.q >= maze[0].length) return false;
                if (maze[cell.r + dir.r][cell.q + dir.q]) return false;

                let openCells = CARDINALS.filter(dir2 => {
                    let [cq, cr] = [cell.q + dir.q + dir2.q, cell.r + dir.r + dir2.r];
                    if (cr < 0 || cr >= maze.length || cq < 0 || cq >= maze[0].length) return false;
                    return !maze[cr][cq];
                });
                console.log([dir.q, dir.r, openCells.length]);

                return openCells.length === 3;
            });
            console.log(possible);
            */

            if (possible.length === 0) {
                cells.splice(cells.indexOf(cell), 1);
            } else {
                let choice = possible[rand(0, possible.length)];
                maze[cell.r + choice.r][cell.q + choice.q] = roomNumber;
                cells.push({ q: cell.q + choice.q, r: cell.r + choice.r });
                console.log(cells);
            }
        }
    },

    carveConnectors(maze, rand) {
        let connectors = [];
        let rooms = [];

        for (let r = 1; r < maze.length - 1; r++) {
            for (let q = 1; q < maze.length - 1; q++) {
                let room1, room2;

                let [up, down, left, right] = [
                    maze[r - 1][q],
                    maze[r + 1][q],
                    maze[r][q - 1],
                    maze[r][q + 1]
                ];

                if (up && down && up !== down) {
                    room1 = up, room2 = down;
                } else if (left && right && left !== right) {
                    room1 = left, room2 = right;
                }

                if (room1 && room2) {
                    if (room1 > room2) {
                        [room1, room2] = [room2, room1];
                    }
                    connectors.push({ q, r, room1, room2 });
                    rooms.push(room1, room2);
                    //connectors.push({ q, r, room1: room2, room2: room1 });
                    /*connectors[room1] = connectors[room1] || [];
                    connectors[room1][room2] = connectors[room1][room2] || [];
                    connectors[room1][room2].push({ q, r });
                    connectors[room2] = connectors[room2] || [];
                    connectors[room2][room1] = connectors[room2][room1] || [];
                    connectors[room2][room1].push({ q, r });*/
                }
            }
        }

        let groups = [...new Set(rooms)].map(a => [a]);
        console.log(groups);

        while (connectors.length > 0) {
            let idx = rand(0, connectors.length);
            let choice = connectors.splice(idx, 1)[0];
            maze[choice.r][choice.q] = choice.room1;

            let group1 = groups.find(group => group.includes(choice.room1));
            let group2 = groups.find(group => group.includes(choice.room2));

            if (rand() > 0.2) {
                connectors = connectors.filter(c => !(
                    (group1.includes(c.room1) && group2.includes(c.room2)) ||
                    (group2.includes(c.room1) && group1.includes(c.room2))
                ));
            }

            if (group1 !== group2) {
                groups.splice(groups.indexOf(group2), 1);
                group1.push(...group2);
            }
        }
/*
        while (groups.length > 1) {
            let a = rand(0, groups.length);
            let b = (a + 1) % groups.length;
            let possible = connectors.filter(pair => groups[a].includes(pair.room1) && groups[b].includes(pair.room2));
            console.log(possible);
            let choice = possible[rand(0, possible.length)];

            maze[choice.r][choice.q] = pair.room1;
            groups.splice(b, 1);
            groups[a] = groups[a].concat(groups[b]);
        }
        */

        /*for (let pair of Object.keys(connectors)) {
            let choice = connectors[pair][rand(0, connectors[pair].length)];
            maze[choice.r][choice.q] = 2;
        }*/
    },

    pruneDeadEnds(maze, rand) {
        let deadEnds = [];

        for (let r = 0; r < maze.length; r++) {
            for (let q = 0; q < maze[0].length; q++) {
                if (maze[r][q] && MazeGenerator.openCrossCells(maze, q, r).length >= 3) {
                    deadEnds.push({ q, r });
                }
            }
        }

        while (deadEnds.length > 0) {
            let idx = rand(0, deadEnds.length);
            let cell = deadEnds.splice(idx, 1)[0];

            if (rand() < 0.45) {
                let possible = CARDINALS.filter(dir => {
                    return MazeGenerator.openCrossCells(maze, cell.q + dir.q, cell.r + dir.r).length <= 2 &&
                      (cell.q+dir.q) >= 0 && (cell.q+dir.q) < maze[0].length &&
                      (cell.r+dir.r) >= 0 && (cell.r+dir.r) < maze.length;
                });
                let choice = possible[rand(0, possible.length)];
                if (choice) {
                    maze[cell.r + choice.r][cell.q + choice.q] = maze[cell.r][cell.q];
                    continue;
                }
            }

            if (rand() > 0.05) {
                maze[cell.r][cell.q] = 0;
                CARDINALS.forEach(dir => {
                    let [cq, cr] = [cell.q + dir.q, cell.r + dir.r];
                    if (maze[cr][cq] && MazeGenerator.openCrossCells(maze, cq, cr).length >= 3 &&
                        cq >= 0 && cq < maze[0].length && cr >= 0 && cr < maze.length) {
                        deadEnds.push({ q: cq, r: cr });
                    }
                });
            }
        }
    },

    createRoomLookup(rooms) {
        return rooms.reduce((hash, room) => {
            hash[room.roomNumber] = hash[room.roomNumber] || [];
            hash[room.roomNumber].push(room);
            return hash;
        }, {});
    },

    createTiles(maze, rand) {
        let tiles = G.array2d(maze[0].length, maze.length, () => {
            return (rand() < 0.1 ? C.TILE_WALL2 : C.TILE_WALL1) + (0b000_010_000 << 4);
        });
        for (let r = 0; r < tiles.length; r++) {
            for (let q = 0; q < tiles[0].length; q++) {
                if (maze[r][q]) {
                    let key =
                        (maze[r - 1][q - 1] ? 0 : 0b100_000_000) +
                        (maze[r - 1][q]     ? 0 : 0b010_000_000) +
                        (maze[r - 1][q + 1] ? 0 : 0b001_000_000) +
                        (maze[r][q - 1]     ? 0 : 0b000_100_000) +
                        (maze[r][q]         ? 0 : 0b000_010_000) +
                        (maze[r][q + 1]     ? 0 : 0b000_001_000) +
                        (maze[r + 1][q - 1] ? 0 : 0b000_000_100) +
                        (maze[r + 1][q]     ? 0 : 0b000_000_010) +
                        (maze[r + 1][q + 1] ? 0 : 0b000_000_001);
                    tiles[r][q] = (key << 4) + C.TILE_FLOOR1;
                }
            }
        }
        return tiles;
    },

    generate(seed) {
        let maze = G.array2d(99, 99, 0);
        //let rand = Random.seed("apples");
        let rand = Random.seed(seed);

        let roomNumber = 1;

        let result = MazeGenerator.attemptRoomPlacement(maze, rand, [{ q: 0, r: 0 }, { q: 99, r: 99 }], 11, 9, roomNumber++);
        console.log(result);
        let rooms = [result];

        for (let i = 0; i < 100; i++) {
            let w = rand(3, 4) * 2 + 1;
            let h = rand(3, 4) * 2 + 1;
            result = MazeGenerator.attemptRoomPlacement(maze, rand, [{ q: 0, r: 0 }, { q: 99, r: 99 }], w, h, roomNumber);
            if (result) rooms.push(result);
            if (result && result.roomNumber === roomNumber) roomNumber++;
        }
        for (let i = 0; i < 100; i++) {
            let w = rand(2, 4) * 2 + 1;
            let h = rand(2, 4) * 2 + 1;
            result = MazeGenerator.attemptRoomPlacement(maze, rand, [{ q: 0, r: 0 }, { q: 99, r: 99 }], w, h, roomNumber);
            if (result) rooms.push(result);
            if (result && result.roomNumber === roomNumber) roomNumber++;
        }
        for (let i = 0; i < 100; i++) {
            let w = rand(1, 4) * 2 + 1;
            let h = rand(1, 4) * 2 + 1;
            result = MazeGenerator.attemptRoomPlacement(maze, rand, [{ q: 0, r: 0 }, { q: 99, r: 99 }], w, h, roomNumber);
            if (result) rooms.push(result);
            if (result && result.roomNumber === roomNumber) roomNumber++;
        }

        /*
        random room placement

        for (let i = 0; i < 900; i++) {
            let w = rand(1, 4) * 2 + 1;
            let h = rand(1, 4) * 2 + 1;
            result = MazeGenerator.attemptRoomPlacement(maze, rand, [{ q: 0, r: 0 }, { q: 99, r: 99 }], w, h, roomNumber++);
            console.log(result);
        }
        */

        for (let r = 1; r < 99; r += 2) {
            for (let q = 1; q < 99; q += 2) {
                if (MazeGenerator.openCrossCells(maze, q, r).length === 5) {
                    MazeGenerator.carveMaze(maze, rand, q, r, roomNumber++);
                }
            }
        }

        MazeGenerator.carveConnectors(maze, rand);

        MazeGenerator.pruneDeadEnds(maze, rand);

        let homeflow = G.flood(maze, rooms[0]);
        return {
            maze,
            tiles: MazeGenerator.createTiles(maze, rand),
            rand,
            rooms: this.createRoomLookup(rooms),
            flowhome: homeflow
        };
    }
};
