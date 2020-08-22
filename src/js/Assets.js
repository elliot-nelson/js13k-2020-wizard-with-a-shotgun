'use strict';

import { Constants as C } from './Constants';
import { Canvas } from './Canvas';
import { SpriteSheet } from './SpriteSheet-gen';

// The spritesheet is produced during the gulp build
const SPRITESHEET_URI = 'sprites.png';

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
    Sprite.font = await this.initBasicSprite(SpriteSheet.font_1);

    // Player
    Sprite.player = await this.initBasicSprite(SpriteSheet.player2_1);

    // Bullets
    Sprite.bullet = await this.initBasicSprite(SpriteSheet.bullet_1);

    // Enemy
    Sprite.monster = await this.initBasicSprite(SpriteSheet.monster2_1);
    Sprite.monster_dead = await this.initBasicSprite(SpriteSheet.monster2_2);

    // GUI
    Sprite.hud_shells_empty = await this.initBasicSprite(SpriteSheet.hud_shells_1);
    Sprite.hud_shells_full = await this.initBasicSprite(SpriteSheet.hud_shells_2);
    Sprite.hud_health_frame = await this.initBasicSprite(SpriteSheet.hud_healthbar_1);
    Sprite.hud_health_fill = await this.initBasicSprite(SpriteSheet.hud_healthbar_2);
    Sprite.hud_crosshair = await this.initBasicSprite(SpriteSheet.hud_crosshair_1);

    Sprite.laserwall = [
      await this.initBasicSprite(SpriteSheet.blood_laser_1),
      await this.initBasicSprite(SpriteSheet.blood_laser_2),
      await this.initBasicSprite(SpriteSheet.blood_laser_3)
    ];

    // Pages
    Sprite.page = await this.initBasicSprite(SpriteSheet.page_1);

    // Tiles
    Sprite.tiles = [];
    Sprite.tiles[C.TILE_FLOOR1] = await this.initBasicSprite(SpriteSheet.tileset_3);
    Sprite.tiles[C.TILE_WALL1] = await this.initBasicSprite(SpriteSheet.tileset_1);
    Sprite.tiles[C.TILE_WALL2] = await this.initBasicSprite(SpriteSheet.tileset_2);

    // Walls
    Sprite.walls = await this.initBasicSprite(SpriteSheet.walls_1);
  };

  /**
   * Initialize a sprite by loading it from a particular slice of the given image. Provides
   * "sensible" defaults for bounding box and anchor point if not provided.
   */
  static async initBasicSprite(data, opts) {
    return this.initDynamicSprite(await this.loadSlice(SPRITESHEET_URI, data.x, data.y, data.w, data.h), opts);
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
