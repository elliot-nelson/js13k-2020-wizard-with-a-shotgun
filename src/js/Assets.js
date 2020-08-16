'use strict';

import { Constants as C } from './Constants';
import { Canvas } from './Canvas';
import { SpriteSheet } from './SpriteSheet-gen';

const SPRITESHEET_URI = 'sprites.png'; // produced during gulp build

/**
 * Sprites!
 *
 * For this game, a "sprite" is a little object that has an attached image, an anchor
 * point, a bounding box, and an optional hit box. This keeps pixel-level data about
 * the image all in one place (by passing a Sprite around, we know what image to draw,
 * what point in the image to rotate around, what areas of the image can get hit by
 * things, and what areas can hit other things).
 *
 * Whether the bounding box or hitbox do anything isn't up to the Sprite, it would be
 * up to the Frame that references it. (This is helpful because it's convenient for
 * a simple game like this to have only one hit frame, but the animation may call
 * for showing the sword swipe for 5-6 frames.)
 */
export class Sprite {
  /**
   * A small helper that draws a sprite onto a canvas, respecting the anchor point of
   * the sprite. Note that the canvas should be PRE-TRANSLATED and PRE-ROTATED, if
   * that's appropriate!
   */
  static drawSprite(ctx, sprite, u, v) {
    ctx.drawImage(sprite.img, u - sprite.anchor.x, v - sprite.anchor.y);
  }

  static drawViewportSprite(viewport, sprite, spritePos, cameraPos) {
    viewport.ctx.drawImage(
      sprite.img,
      spritePos.x - sprite.anchor.x - cameraPos.x + viewport.center.u,
      spritePos.y - sprite.anchor.y - cameraPos.y + viewport.center.v
    );
  }

  /**
   * Draw a sprite's bounding box, for debugging, using the same rules as drawSprite.
   */
  static drawBoundingBox(ctx, sprite, x, y) {
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.5)';
    ctx.strokeRect(
      x - sprite.anchor.x + sprite.bbox[0].x,
      y - sprite.anchor.y + sprite.bbox[0].y,
      sprite.bbox[1].x - sprite.bbox[0].x,
      sprite.bbox[1].y - sprite.bbox[0].y
    );
  }

  /**
   * Draw a sprite's hit box, for debugging, using the same rules as drawSprite.
   */
  static drawHitBox(ctx, sprite, x, y) {
    if (sprite.hbox) {
      ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)';
      ctx.strokeRect(
        x - sprite.anchor.x + sprite.hbox[0].x,
        y - sprite.anchor.y + sprite.hbox[0].y,
        sprite.hbox[1].x - sprite.hbox[0].x,
        sprite.hbox[1].y - sprite.hbox[0].y
      );
    }
  }

  static getBoundingCircle(sprite, x, y) {
    let dx = sprite.bbox[1].x - sprite.bbox[0].x;
    let dy = sprite.bbox[1].y - sprite.bbox[0].y;
    let r = (dx > dy ? dx : dy) / 2;
    return {
      x: x - sprite.anchor.x + (sprite.bbox[0].x + sprite.bbox[1].x) / 2,
      y: y - sprite.anchor.y + (sprite.bbox[0].y + sprite.bbox[1].y) / 2,
      r
    };
  }

  static getBoundingBoxPolygon(sprite, x, y) {
    return this.getSpriteBoxPolygon(sprite.anchor, sprite.bbox, x, y);
  }

  static getHitBoxPolygon(sprite, x, y) {
    return this.getSpriteBoxPolygon(sprite.anchor, sprite.hbox, x, y);
  }

  static getSpriteBoxPolygon(anchor, box, x, y) {
    return {
      x: x,
      y: y,
      p: [
        { x: box[0].x - anchor.x, y: box[0].y - anchor.y },
        { x: box[1].x - anchor.x, y: box[0].y - anchor.y },
        { x: box[1].x - anchor.x, y: box[1].y - anchor.y },
        { x: box[0].x - anchor.x, y: box[1].y - anchor.y }
      ]
    };
  }
}

/**
 * The Assets module loads raw PNGs we'll use to draw the game, does any postprocessing stuff
 * we might need to do, and then saves references to them for later.
 */
export class Assets {
  static async init() {
    this.images = {};

    // Base Pixel Font (see `Text.init` for additional manipulation)
    Sprite.font = await this.initSprite(SPRITESHEET_URI, SpriteSheet.font_1);

    // Player
    Sprite.player = await this.initSprite(SPRITESHEET_URI, SpriteSheet.player2_1);

    // Bullets
    Sprite.bullet = await this.initSprite(SPRITESHEET_URI, SpriteSheet.bullet_1);

    // Enemy
    Sprite.monster = await this.initSprite(SPRITESHEET_URI, SpriteSheet.monster2_1);
    Sprite.monster_dead = await this.initSprite(SPRITESHEET_URI, SpriteSheet.monster2_2);
    Sprite.demon_walk = await this.initSprite(SPRITESHEET_URI, SpriteSheet.demon1_1);

    // Tiles
    Sprite.tiles = [];
    Sprite.tiles[C.TILE_FLOOR1] = await this.initSprite(SPRITESHEET_URI, SpriteSheet.tileset_3);
    Sprite.tiles[C.TILE_WALL1] = await this.initSprite(SPRITESHEET_URI, SpriteSheet.tileset_1);
    Sprite.tiles[C.TILE_WALL2] = await this.initSprite(SPRITESHEET_URI, SpriteSheet.tileset_2);

    // Walls
    let edge = await this.initSprite(SPRITESHEET_URI, SpriteSheet.tileset_5);
    let turn = await this.initSprite(SPRITESHEET_URI, SpriteSheet.tileset_6);
    let deadend = await this.initSprite(SPRITESHEET_URI, SpriteSheet.tileset_7);
    let corner = await this.initSprite(SPRITESHEET_URI, SpriteSheet.tileset_8);

    Sprite.walls = [];
    Sprite.walls[0b000_100_000] =
    Sprite.walls[0b100_100_000] =
    Sprite.walls[0b000_100_100] =
    Sprite.walls[0b100_100_100] = edge;

    Sprite.walls[0b000_001_000] =
    Sprite.walls[0b001_001_000] =
    Sprite.walls[0b000_001_001] =
    Sprite.walls[0b001_001_001] = this.initDynamicSprite(this.rotateImage(edge.img, C.R180));

    Sprite.walls[0b010_000_000] =
    Sprite.walls[0b110_000_000] =
    Sprite.walls[0b011_000_000] =
    Sprite.walls[0b111_000_000] = this.initDynamicSprite(this.rotateImage(edge.img, C.R90));

    Sprite.walls[0b000_001_000] = this.initDynamicSprite(this.rotateImage(edge.img, C.R180));
    Sprite.walls[0b000_000_010] = this.initDynamicSprite(this.rotateImage(edge.img, C.R270));

    Sprite.walls[0b010_100_000] =
    Sprite.walls[0b110_100_000] =
    Sprite.walls[0b011_100_000] =
    Sprite.walls[0b111_100_000] =
    Sprite.walls[0b011_100_100] =
    Sprite.walls[0b010_100_100] =
    Sprite.walls[0b011_100_100] =
    Sprite.walls[0b111_100_100] = turn;

    Sprite.walls[0b010_001_000] =
    Sprite.walls[0b011_001_000] =
    Sprite.walls[0b110_001_000] =
    Sprite.walls[0b111_001_000] =
    Sprite.walls[0b010_001_001] =
    Sprite.walls[0b011_001_001] =
    Sprite.walls[0b111_001_001] =
    Sprite.walls[0b110_001_001] = this.initDynamicSprite(this.rotateImage(turn.img, C.R90));

    Sprite.walls[0b000_001_010] =
    Sprite.walls[0b000_001_011] =
    Sprite.walls[0b000_001_110] =
    Sprite.walls[0b000_001_111] =
    Sprite.walls[0b001_001_010] =
    Sprite.walls[0b001_001_011] =
    Sprite.walls[0b001_001_110] =
    Sprite.walls[0b001_001_111] = this.initDynamicSprite(this.rotateImage(turn.img, C.R180));

    Sprite.walls[0b000_100_010] =
    Sprite.walls[0b000_100_011] =
    Sprite.walls[0b000_100_110] =
    Sprite.walls[0b000_100_111] =
    Sprite.walls[0b100_100_010] =
    Sprite.walls[0b100_100_011] =
    Sprite.walls[0b100_100_110] =
    Sprite.walls[0b100_100_111] = this.initDynamicSprite(this.rotateImage(turn.img, C.R270));

    Sprite.walls[0b100_000_000] = corner;
    Sprite.walls[0b001_000_000] = this.initDynamicSprite(this.rotateImage(corner.img, C.R90));
    Sprite.walls[0b000_000_001] = this.initDynamicSprite(this.rotateImage(corner.img, C.R180));
    Sprite.walls[0b000_000_100] = this.initDynamicSprite(this.rotateImage(corner.img, C.R270));

    Sprite.walls[0b101_000_000] = this.initDynamicSprite(this.overlay(Sprite.walls[0b100_000_000].img, Sprite.walls[0b001_000_000].img));
    Sprite.walls[0b000_000_101] = this.initDynamicSprite(this.overlay(Sprite.walls[0b000_000_100].img, Sprite.walls[0b000_000_001].img));
    Sprite.walls[0b100_000_100] = this.initDynamicSprite(this.overlay(Sprite.walls[0b100_000_000].img, Sprite.walls[0b000_000_100].img));
    Sprite.walls[0b001_000_001] = this.initDynamicSprite(this.overlay(Sprite.walls[0b001_000_000].img, Sprite.walls[0b000_000_001].img));

/*
    let sprite = await this.initSprite(SPRITESHEET_URI, SpriteSheet.tileset_5);
    Sprite.tiles[C.TILE_FLOOR_EDGE_L] = sprite;
    Sprite.tiles[C.TILE_FLOOR_EDGE_T] = this.initDynamicSprite(this.rotateImage(sprite.img, Math.PI * 0.5));
    Sprite.tiles[C.TILE_FLOOR_EDGE_R] = this.initDynamicSprite(this.rotateImage(sprite.img, Math.PI * 1.0));
    Sprite.tiles[C.TILE_FLOOR_EDGE_B] = this.initDynamicSprite(this.rotateImage(sprite.img, Math.PI * 1.5));

    sprite = await this.initSprite(SPRITESHEET_URI, SpriteSheet.tileset_7);
    Sprite.tiles[C.TILE_FLOOR_EDGE_LT] = sprite;
    Sprite.tiles[C.TILE_FLOOR_EDGE_TR] = this.initDynamicSprite(this.rotateImage(sprite.img, Math.PI * 0.5));
    Sprite.tiles[C.TILE_FLOOR_EDGE_RB] = this.initDynamicSprite(this.rotateImage(sprite.img, Math.PI * 1.0));
    Sprite.tiles[C.TILE_FLOOR_EDGE_BL] = this.initDynamicSprite(this.rotateImage(sprite.img, Math.PI * 1.5));

    sprite = await this.initSprite(SPRITESHEET_URI, SpriteSheet.tileset_8);
    Sprite.tiles[C.TILE_FLOOR_EDGE_LTR] = sprite;
    Sprite.tiles[C.TILE_FLOOR_EDGE_TRB] = this.initDynamicSprite(this.rotateImage(sprite.img, Math.PI * 0.5));
    Sprite.tiles[C.TILE_FLOOR_EDGE_RBL] = this.initDynamicSprite(this.rotateImage(sprite.img, Math.PI * 1.0));
    Sprite.tiles[C.TILE_FLOOR_EDGE_BLT] = this.initDynamicSprite(this.rotateImage(sprite.img, Math.PI * 1.5));

    sprite = await this.initSprite(SPRITESHEET_URI, SpriteSheet.tileset_6);
    Sprite.tiles[C.TILE_FLOOR_EDGE_LR] = sprite;
    Sprite.tiles[C.TILE_FLOOR_EDGE_TB] = this.initDynamicSprite(this.rotateImage(sprite.img, Math.PI * 0.5));
// TILE_FLOOR1:            0,
// TILE_FLOOR2:            1,
// TILE_FLOOR_EDGE_L:     20,
// TILE_FLOOR_EDGE_T:     21,
// TILE_FLOOR_EDGE_R:     22,
// TILE_FLOOR_EDGE_B:     23,
// TILE_FLOOR_EDGE_LT:    24,
// TILE_FLOOR_EDGE_TR:    25,
// TILE_FLOOR_EDGE_RB:    26,
// TILE_FLOOR_EDGE_BL:    27,
// TILE_FLOOR_EDGE_LTR:   28,
// TILE_FLOOR_EDGE_TRB:   29,
// TILE_FLOOR_EDGE_RBL:   30,
// TILE_FLOOR_EDGE_BLT:   31,
// TILE_FLOOR_EDGE_LR:    32,
// TILE_FLOOR_EDGE_TB:    33,
// TILE_FLOOR_CORNER_LT:  34,
// TILE_FLOOR_CORNER_TR:  35,
// TILE_FLOOR_CORNER_RB:  36,
// TILE_FLOOR_CORNER_BL:  37,
// TILE_FLOOR_CORNER_LR:  39,
    Sprite.tiles[C.TILE_WALL1] = await this.initSprite(SPRITESHEET_URI, SpriteSheet.tileset_1);
    Sprite.tiles[C.TILE_WALL2] = await this.initSprite(SPRITESHEET_URI, SpriteSheet.tileset_2);
    */
  };

  /**
   * Initialize a sprite by loading it from a particular slice of the given image. Provides
   * "sensible" defaults for bounding box and anchor point if not provided.
   */
  static async initSprite(uri, data, opts) {
    return this.initDynamicSprite(await this.loadSlice(uri, data.x, data.y, data.w, data.h), opts);
  }

  static rotateImage(source, rad) {
    let canvas = new Canvas(source.width, source.height);
    canvas.ctx.translate(source.width / 2, source.height / 2);
    canvas.ctx.rotate(rad);
    canvas.ctx.translate(-source.width / 2, -source.height / 2);
    canvas.ctx.drawImage(source, 0, 0);
    return canvas.canvas;
  }

  static overlay(...sources) {
    let canvas = new Canvas(sources[0].width, sources[0].height);
    for (let source of sources) {
      canvas.ctx.drawImage(source, 0, 0);
    }
    return canvas.canvas;
  }

  /**
   * Initialize a sprite by passing it a pre-defined image source (probably generated dynamically).
   * Provides "sensible" defaults for bounding box and anchor point if not provided.
   */
  static initDynamicSprite(source, opts) {
    let w = source.width, h = source.height;

    return {
      img: source,
      anchor: (opts && opts.anchor) || { x: Math.floor(w / 2), y: Math.floor(h / 2) },
      bbox: (opts && opts.bbox) || [{x: 0, y: 0 }, { x: w, y: h }],
      hbox: opts && opts.hbox
    };
  }

  /**
   * This helper method retrieves a cached image, cuts the specified slice out of it, and returns it.
   */
  static async loadSlice(uri, x, y, w, h) {
    const source = await this.loadImage(uri);
    const sliceCanvas = new Canvas(w, h);
    sliceCanvas.ctx.drawImage(source, x, y, w, h, 0, 0, w, h);
    return sliceCanvas.canvas;
  }

  /**
   * Load the image from the given URI and cache it.
   */
  static async loadImage(uri) {
    if (this.images[uri]) return this.images[uri];

    return await new Promise((resolve, reject) => {
      let image = new Image();
      image.onload = () => resolve(image);
      image.onerror = (err) => reject(err);
      image.src = uri;
      this.images[uri] = image;
    });
  }
}
