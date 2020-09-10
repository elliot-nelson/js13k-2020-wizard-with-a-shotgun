'use strict';

const Aseparser = require('ase-parser');
const fs = require('fs');
const util = require('util');

const SPACE    = 0;
const ROOM     = 1;
const SAFEROOM = 2;
const SPAWN    = 3;
const TUNNEL   = 4;
const ENDING   = 5;

/**
 * Similar to the image data parser, the map data parser updates a generated source
 * containing the map data. Like all things, this is a compromise -- it's a trade-off
 * between raw "map data" (which is generally very expensive because it's high entropy)
 * and "processing code".
 */
const MapDataParser = {
    parse: function(dataFile, outputFile) {
        let data = MapDataParser._parseDataFile(dataFile);
        MapDataParser._writeOutputFile(data, outputFile);
    },
    _parseDataFile(dataFile) {
        // Extract the map layer from our map aseprite file - lets me use
        // Aseprite as my map editor, which is pretty easy for this simple game.
        const data = new Aseparser(fs.readFileSync(dataFile), dataFile);
        data.parse();
        let { w, h, rawCelData: buffer } = data.frames[0].cels[1];

        // Convert specific pixel colors in the image into known tile types
        // in a temporary map, which will be used in the next step.
        let map = [];
        let pattern = [];
        for (let y = 0; y < h; y++) {
            map[y] = [];
            pattern[y] = [];
            for (let x = 0; x < w; x++) {
                let p = (y * w + x) * 4;
                let [r, g, b, a] = [buffer[p], buffer[p + 1], buffer[p + 2], buffer[p + 3]];

                map[y][x] = SPACE;

                if (r === 172 && g === 50) {
                    map[y][x] = ROOM;
                    pattern[y][x] = (b - 50) / 5;
                } else if (r === 106 && g === 190 && b === 48) {
                    map[y][x] = SAFEROOM;
                } else if (r === 153 && g === 229 && b === 80) {
                    map[y][x] = SPAWN;
                } else if (r === 143 && g === 86 && b === 59) {
                    map[y][x] = TUNNEL;
                } else if (r === 79 && g === 222 && b === 227) {
                    map[y][x] = ENDING;
                }
            }
        }

        // Ensure open space never touches the map edge by adding a border.
        // (This little trick just helps out on complexity in a lot of different
        // algorithms in the game -- nothing's more annoying than writing
        // `&& x >= 0 && x <= w-1` etc. etc. everywhere.)
        map.forEach(row => {
            row.unshift(SPACE);
            row.push(SPACE);
        });
        w += 2;
        map.unshift(Array.from(Array(w), () => SPACE));
        map.push(Array.from(Array(w), () => SPACE));
        h += 2;

        // Now we can build the "maze format" we'll actually store in the game's source files.
        let maze = [];
        let rooms = [];
        let tunnels = [];
        let roomNumber = 5;

        let lastTunnel = 0;

        for (let y = 0; y < h; y++) {
            maze[y] = maze[y] || [];
            for (let x = 0; x < w; x++) {
                if (map[y][x] === ROOM && !maze[y][x]) {
                    rooms.push(MapDataParser._floodRoom(map, maze, w, h, x, y, roomNumber++, pattern[y][x]));
                } else if (map[y][x] === SPAWN) {
                    // q, r, w, h, roomNumber
                    rooms.push([x, y, 1, 1, 1]);
                    maze[y][x] = 3;
                } else if (map[y][x] === ENDING) {
                    // q, r, w, h, roomNumber
                    rooms.push([x, y, 1, 1, 2]);
                    maze[y][x] = 3;
                } else if (map[y][x] === TUNNEL || map[y][x] === SAFEROOM) {
                    tunnels.push(y * w + x - lastTunnel);
                    lastTunnel = y * w + x;
                }
            }
        }

        return { w, h, rooms, tunnels };
    },
    _floodRoom(map, maze, w, h, x, y, roomNumber, pattern) {
        let left = x, right = x, top = y, bottom = y;
        let queue = [{ x, y, cost: 0 }];
        let visited = [];

        while (queue.length > 0) {
            let { x, y, cost } = queue.pop();
            if (visited[y * w + x] < cost) continue;
            if (!map[y] || map[y][x] !== ROOM) continue;
            visited[y * w + x] = cost;
            maze[y] = maze[y] || [];
            maze[y][x] = roomNumber;

            left = Math.min(left, x);
            right = Math.max(right, x);
            top = Math.min(top, y);
            bottom = Math.max(bottom, y);
            queue.push({ x: x + 1, y, cost: cost + 1 });
            queue.push({ x: x - 1, y, cost: cost + 1 });
            queue.push({ x, y: y + 1, cost: cost + 1 });
            queue.push({ x, y: y - 1, cost: cost + 1 });
        }

        // q, r, w, h, roomNumber, pattern
        return [left, top, right - left + 1, bottom - top + 1, roomNumber, pattern];
    },
    _writeOutputFile(data, outputFile) {
        let js = fs.readFileSync(outputFile, 'utf8');
        let lines = js.split('\n');
        let prefix = lines.findIndex(value => value.match(/<generated>/));
        let suffix = lines.findIndex(value => value.match(/<\/generated>/));

        let generated = util.inspect(data, { compact: true, maxArrayLength: Infinity, depth: Infinity });
        generated = lines.slice(0, prefix + 1).join('\n') + '\n' + generated + '\n' + lines.slice(suffix).join('\n');

        fs.writeFileSync(outputFile, generated, 'utf8');
    }
};

module.exports = MapDataParser;
