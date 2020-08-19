'use strict';

/**
 * Seeded random number generator, using SimpleFastCounter for generator and
 * xmur3 for hashing.
 *
 * https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
 */
export const Random = {
  sfc32(a, b, c, d) {
    return () => {
      a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
      let t = (a + b) | 0;
      a = b ^ b >>> 9;
      b = c + (c << 3) | 0;
      c = (c << 21 | c >>> 11);
      d = d + 1 | 0;
      t = t + d | 0;
      c = c + t | 0;
      return (t >>> 0) / 4294967296;
    }
  },

  xmur3(str) {
    let i, h;
    for (i = 0, h = 1779033703 ^ str.length; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
      h = h << 13 | h >>> 19;
    }

    return () => {
      h = Math.imul(h ^ h >>> 16, 2246822507);
      h = Math.imul(h ^ h >>> 13, 3266489909);
      return (h ^= h >>> 16) >>> 0;
    }
  },

  seed(str) {
    let seedfn = this.xmur3(str);
    let randfn = this.sfc32(seedfn(), seedfn(), seedfn(), seedfn());

    // If min/max are not supplied, returns a random floating point value
    // (>=0 && <1). If they are supplied, returns a random integer value
    // (>=min && <max).
    return (min, max) => {
      if (typeof min === "number" && typeof max === "number") {
        return Math.floor(randfn() * (max - min)) + min;
      } else {
        return randfn();
      }
    };
  }
};
