'use strict';

import { R90, R270, R360, TILE_SIZE } from './Constants';
import { game } from './Game';
import { Viewport } from './Viewport';

export function normalizeVector(p) {
    let m = Math.sqrt(p.x * p.x + p.y * p.y);
    return m === 0 ? { x: 0, y: 0, m: 0 } : { x: p.x / m, y: p.y / m, m };
}

export function vectorBetween(p1, p2) {
    return normalizeVector({ x: p2.x - p1.x, y: p2.y - p1.y });
}

export function angle2vector(r, m) {
    return { x: Math.cos(r), y: Math.sin(r), m: m || 1 };
}

export function vector2angle(v) {
    let angle = Math.atan2(v.y, v.x);
    if (angle < 0) angle += R360;
    return angle;
}

export function vector2point(v) {
    return { x: v.x * (v.m || 1), y: v.y * (v.m || 1) };
}

export function dot(a, b) {
    [a, b] = [vector2point(a), vector2point(b)];
    return a.x * b.x + a.y * b.y;
}

// Takes a series of vectors and denormalizes them and adds them together, usually resulting
// in a point in space. Wrap in normalizeVector to get a normalized vector again, if desired.
export function vectorAdd(...vectors) {
    let v = { x: 0, y: 0, m: 1 };
    for (let vector of vectors) {
        v.x += vector.x * (vector.m || 1);
        v.y += vector.y * (vector.m || 1);
    }
    return v;
}

export function closestAngleDifference(a, b) {
    if (a > b) [a, b] = [b, a];
    return Math.min(b - a, R360 + a - b);
}

export function intermediateAngle(a, b, m) {
    if (b > R270 && a <= R90) a += R360;
    if (a > R270 && b <= R90) b += R360;
    let angle = (b - a) * m + a;
    return (angle + R360) % R360;
}

export function angleBetween(angle, min, max) {
    if (min > max) [min, max] = [max, min];
    while (angle >= max + R360) angle -= R360;
    while (angle <= min - R360) angle += R360;
    return angle >= min && angle < max;
}

export function arcOverlap(angleA1, angleA2, angleB1, angleB2) {
    if (angleA1 > angleA2) [angleA1, angleA2] = [angleA2, angleA1];
    if (angleB1 > angleB2) [angleB1, angleB2] = [angleB2, angleB1];

    while (angleB2 >= angleA2 + R360) {
        angleB2 -= R360;
        angleB1 -= R360;
    }
    while (angleB1 <= angleA1 - R360) {
        angleB1 += R360;
        angleB2 += R360;
    }

    const result = [Math.max(angleA1, angleB1), Math.min(angleA2, angleB2)];
    return result[0] > result[1] ? undefined : result;
}

export function xy2qr(pos) {
    return { q: (pos.x / TILE_SIZE) | 0, r: (pos.y / TILE_SIZE) | 0 };
}

export function qr2xy(pos) {
    return { x: pos.q * TILE_SIZE, y: pos.r * TILE_SIZE };
}

export function xy2uv(pos) {
    return {
        u: pos.x + Viewport.center.u - game.camera.pos.x,
        v: pos.y + Viewport.center.v - game.camera.pos.y
    };
}

export function uv2xy(pos) {
    return {
        x: pos.u - Viewport.center.u + game.camera.pos.x,
        y: pos.v - Viewport.center.v + game.camera.pos.y
    };
}

export function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
}

// The parameters to this function are (Q, Q) or (R, R) - i.e. horizontal or
// vertical coordinates in tile space.
export function calculateRayIntersectionAndStep(startPos, endPos) {
    let next,
        step,
        diff = endPos - startPos;

    if (diff === 0) {
        step = NaN;
        next = +Infinity;
    } else if (diff > 0) {
        step = 1 / diff;
        next = (1 - (startPos - (startPos | 0))) * step;
    } else {
        step = -1 / diff;
        next = (startPos - (startPos | 0)) * step;
    }

    return { next, step };
}

// https://www.genericgamedev.com/general/shooting-rays-through-tilemaps/
export function* tilesHitBetween(p1, p2) {
    let startQ = p1.x / TILE_SIZE,
        startR = p1.y / TILE_SIZE;
    let endQ = p2.x / TILE_SIZE,
        endR = p2.y / TILE_SIZE;
    let tileCount =
        Math.abs((startQ | 0) - (endQ | 0)) +
        Math.abs((startR | 0) - (endR | 0));

    yield { q: startQ | 0, r: startR | 0, m: 0 };

    // If there's only 1 or 2 hit tiles, we don't need the math to compute the middle.
    if (tileCount > 1) {
        let q = startQ,
            r = startR,
            m = 0;
        let stepQ = Math.sign(endQ - startQ);
        let stepR = Math.sign(endR - startR);
        let intersectionQ = calculateRayIntersectionAndStep(startQ, endQ);
        let intersectionR = calculateRayIntersectionAndStep(startR, endR);

        for (let i = 0; i < tileCount - 1; i++) {
            if (intersectionQ.next < intersectionR.next) {
                q += stepQ;
                m += stepQ;
                intersectionQ.next += intersectionQ.step;
            } else {
                r += stepR;
                m += stepR;
                intersectionR.next += intersectionR.step;
            }
            yield { q: q | 0, r: r | 0, m };
        }
    }

    if (tileCount > 0) {
        yield { q: endQ | 0, r: endR | 0, m: 1 };
    }
}

export function* tilesHitBy(p, v) {
    yield* tilesHitBetween(p, vectorAdd(p, v));
}

/**
 * @param {XY[]} bounds  the upper-left and lower-right bounds
 * @yields {QR}
 */
export function* tilesHitInBounds(bounds) {
    for (let r = bounds[0].y / TILE_SIZE | 0; r * TILE_SIZE < bounds[1].y; r++) {
        for (let q = bounds[0].x / TILE_SIZE | 0; q * TILE_SIZE <  bounds[1].x; q++) {
            yield { q, r };
        }
    }
}

/**
 * @param {XY} p1  the starting position
 * @param {XY} p2  the ending position
 * @param {number} r  the radius of the moving circle
 * @yields {QR}
 */
export function* tilesHitBetweenCircle(p1, p2, r) {
    let bounds = [
        { x: Math.min(p1.x, p2.x) - r, y: Math.min(p1.y, p2.y) - r },
        { x: Math.max(p1.x, p2.x) + r, y: Math.max(p1.y, p2.y) + r }
    ];
    yield* tilesHitInBounds(bounds);
}

/**
 * @param {XY} p  the starting position
 * @param {XY} v  the velocity (movement)
 * @param {number} r  the radius of the moving circle
 * @yields {QR}
 */
export function* tilesHitByCircle(p, v, r) {
    yield* tilesHitBetweenCircle(p, { x: p.x + v.x, y: p.y + v.y }, r);
}

// https://stackoverflow.com/a/18790389/80630
export function intersectCircleRectangle(p1, p2, r, bounds) {
    // If the bounding box around the start and end points (+radius on all
    // sides) does not intersect with the rectangle, definitely not an
    // intersection
    if (
        Math.max(p1.x, p2.x) + r < bounds[0].x ||
        Math.min(p1.x, p2.x) - r > bounds[1].x ||
        Math.max(p1.y, p2.y) + r < bounds[0].y ||
        Math.min(p1.y, p2.y) - r > bounds[1].y
    )
        return;

    let dx = p2.x - p1.x;
    let dy = p2.y - p1.y;
    let invdx = dx === 0 ? 0 : 1 / dx;
    let invdy = dy === 0 ? 0 : 1 / dy;
    let cornerX = Infinity;
    let cornerY = Infinity;

    // Check each side of the rectangle for a single-side intersection
    // Left Side
    if (p1.x - r < bounds[0].x && p2.x + r > bounds[0].x) {
        let ltime = (bounds[0].x - r - p1.x) * invdx;
        if (ltime >= 0 && ltime <= 1) {
            let ly = dy * ltime + p1.y;
            if (ly >= bounds[0].y && ly <= bounds[1].y) {
                return {
                    x: dx * ltime + p1.x,
                    y: ly,
                    t: ltime,
                    nx: -1,
                    ny: 0,
                    ix: bounds[0].x,
                    iy: ly
                };
            }
        }
        cornerX = bounds[0].x;
    }
    // Right Side
    if (p1.x + r > bounds[1].x && p2.x - r < bounds[1].x) {
        let rtime = (p1.x - (bounds[1].x + r)) * -invdx;
        if (rtime >= 0 && rtime <= 1) {
            let ry = dy * rtime + p2.y;
            if (ry >= bounds[0].y && ry <= bounds[1].y) {
                return {
                    x: dx * rtime + p1.x,
                    y: ry,
                    t: rtime,
                    nx: 1,
                    ny: 0,
                    ix: bounds[1].x,
                    iy: ry
                };
            }
        }
        cornerX = bounds[1].x;
    }
    // Top Side
    if (p1.y - r < bounds[0].y && p2.y + r > bounds[0].y) {
        let ttime = (bounds[0].y - r - p1.y) * invdy;
        if (ttime >= 0 && ttime <= 1) {
            let tx = dx * ttime + p1.x;
            if (tx >= bounds[0].x && tx <= bounds[1].x) {
                return {
                    x: tx,
                    y: dy * ttime + p1.y,
                    t: ttime,
                    nx: 0,
                    ny: -1,
                    ix: tx,
                    iy: bounds[0].y
                };
            }
        }
        cornerY = bounds[0].y;
    }
    // Bottom Side
    if (p1.y + r > bounds[1].y && p2.y - r < bounds[1].y) {
        let btime = (p1.y - (bounds[1].y + r)) * -invdy;
        if (btime >= 0 && btime <= 1) {
            let bx = dx * btime + p1.x;
            if (bx >= bounds[0].x && bx <= bounds[1].x) {
                return {
                    x: bx,
                    y: dy * btime + p1.y,
                    t: btime,
                    nx: 0,
                    ny: 1,
                    ix: bx,
                    iy: bounds[0].y
                };
            }
        }
        cornerY = bounds[1].y;
    }

    // If we haven't touched anything, there is no collision
    if (cornerX === Infinity && cornerY === Infinity) return;

    // We didn't pass through a side but may be hitting the corner
    if (cornerX !== Infinity && cornerY === Infinity) {
        cornerY = dy > 0 ? bounds[1].y : bounds[0].y;
    }
    if (cornerY !== Infinity && cornerX === Infinity) {
        cornerX = dx > 0 ? bounds[1].x : bounds[0].x;
    }

    /* Solve the triangle between the start, corner, and intersection point.
     *
     *           +-----------T-----------+
     *           |                       |
     *          L|                       |R
     *           |                       |
     *           C-----------B-----------+
     *          / \
     *         /   \r     _.-E
     *        /     \ _.-'
     *       /    _.-I
     *      / _.-'
     *     S-'
     *
     * S = start of circle's path
     * E = end of circle's path
     * LTRB = sides of the rectangle
     * I = {ix, iY} = point at which the circle intersects with the rectangle
     * C = corner of intersection (and collision point)
     * C=>I (r) = {nx, ny} = radius and intersection normal
     * S=>C = cornerdist
     * S=>I = intersectionDistance
     * S=>E = lineLength
     * <S = innerAngle
     * <I = angle1
     * <C = angle2
     */
    let inverseRadius = 1 / r;
    let lineLength = Math.sqrt(dx * dx + dy * dy);
    let cornerdx = cornerX - p1.x;
    let cornerdy = cornerY - p1.y;
    let cornerDistance = Math.sqrt(cornerdx * cornerdx + cornerdy * cornerdy);
    let innerAngle = Math.acos(
        (cornerdx * dx + cornerdy * dy) / (lineLength * cornerDistance)
    );

    // If the circle is too close, no intersection
    if (cornerDistance < r) return;

    // If inner angle is zero, it's going to hit the corner straight on.
    if (innerAngle === 0) {
        let time = (cornerDistance - r) / lineLength;

        // Ignore if time is outside boundaries of (p1, p2)
        if (time > 1 || time < 0) return;

        let ix = time * dx + p1.x;
        let iy = time * dy + p1.y;
        let nx = cornerdx / cornerDistance;
        let ny = cornerdy / cornerDistance;

        return isNaN(ix)
            ? undefined
            : { x: ix, y: iy, t: time, nx, ny, ix: cornerX, iy: cornerY };
    }

    let innerAngleSin = Math.sin(innerAngle);
    let angle1Sin = innerAngleSin * cornerDistance * inverseRadius;

    // If the angle is too large, there is no collision
    if (Math.abs(angle1Sin) > 1) return;

    let angle1 = Math.PI - Math.asin(angle1Sin);
    let angle2 = Math.PI - innerAngle - angle1;
    let intersectionDistance = (r * Math.sin(angle2)) / innerAngleSin;
    let time = intersectionDistance / lineLength;

    // Ignore if time is outside boundaries of (p1, p2)
    if (time > 1 || time < 0) return;

    let ix = time * dx + p1.x;
    let iy = time * dy + p2.y;
    let nx = (ix - cornerX) * inverseRadius;
    let ny = (iy - cornerY) * inverseRadius;

    return isNaN(ix)
        ? undefined
        : { x: ix, y: iy, t: time, nx, ny, ix: cornerX, iy: cornerY };
}

// https://stackoverflow.com/questions/18683179/how-to-fix-circles-overlap-in-collision-response
//
// This is an incredibly simple implementation that ASSUMES very small velocities. It doesn't attempt
// to answer the question about "when" the intersection happened like the method above - may
// fix that in future.
export function intersectCircleCircle(p1, r1, v1, p2, r2, v2) {
    [v1, v2] = [vector2point(v1), vector2point(v2)];
    let a1 = { x: p1.x + v1.x, y: p1.y + v1.y };
    let a2 = { x: p2.x + v2.x, y: p2.y + v2.y };
    let delta = vectorBetween(a1, a2);
    if (delta.m < r1 + r2) {
        return { nx: delta.x, ny: delta.y, m: r1 + r2 - delta.m };
    }
}

export function flood(maze, pos, maxDistance = Infinity) {
    let result = array2d(maze[0].length, maze.length, () => Infinity);
    let stack = [{ ...pos, cost: 0 }];
    while (stack.length > 0) {
        let { q, r, cost } = stack.shift();
        if (result[r][q] <= cost) continue;
        result[r][q] = cost++;
        if (result[r][q] >= maxDistance) continue;
        if (maze[r][q + 1] && result[r][q + 1] > cost)
            stack.push({ q: q + 1, r, cost });
        if (maze[r][q - 1] && result[r][q - 1] > cost)
            stack.push({ q: q - 1, r, cost });
        if (maze[r + 1][q] && result[r + 1][q] > cost)
            stack.push({ q, r: r + 1, cost });
        if (maze[r - 1][q] && result[r - 1][q] > cost)
            stack.push({ q, r: r - 1, cost });
    }
    return result;
}

export function array2d(width, height, fn) {
    return Array.from({ length: height }, () =>
        Array.from({ length: width }, fn)
    );
}

export function tileIsPassable(q, r) {
    if (game.brawl) {
        let room = game.brawl.room;
        if (
            q < room.q ||
            r < room.r ||
            q >= room.q + room.w ||
            r >= room.r + room.h
        )
            return false;
    }
    if (q < 0 || r < 0 || q >= game.maze.w || r >= game.maze.h) return false;
    return !!game.maze.maze[r][q];
}

export function rgba(r, g, b, a) {
    return `rgba(${r},${g},${b},${a})`;
}

export function createCanvas(width, height) {
    let canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    let ctx = canvas.getContext('2d');
    return { canvas, ctx };
}
