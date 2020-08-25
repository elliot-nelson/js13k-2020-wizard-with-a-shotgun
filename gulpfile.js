// -----------------------------------------------------------------------------
// Imports
// -----------------------------------------------------------------------------
const advpng            = require('imagemin-advpng');
const chalk             = require('chalk');
const childProcess      = require('child_process');
const fs                = require('fs');
const gulp              = require('gulp');
const log               = require('fancy-log');
const rollup            = require('rollup');

const AsepriteCli       = require('./tools/aseprite-cli');
const ImageDataParser   = require('./tools/image-data-parser');
const MapDataParser     = require('./tools/map-data-parser');

// -----------------------------------------------------------------------------
// Gulp Plugins
// -----------------------------------------------------------------------------
const advzip            = require('gulp-advzip');
const concat            = require('gulp-concat');
const cleancss          = require('gulp-clean-css');
const htmlmin           = require('gulp-htmlmin');
const imagemin          = require('gulp-imagemin');
const rename            = require('gulp-rename');
const size              = require('gulp-size');
const sourcemaps        = require('gulp-sourcemaps');
const template          = require('gulp-template');
const terser            = require('gulp-terser');
const zip               = require('gulp-zip');

// -----------------------------------------------------------------------------
// Flags
// -----------------------------------------------------------------------------
let watching = false;
let fast = process.argv.includes('--fast');

// -----------------------------------------------------------------------------
// JS Build
// -----------------------------------------------------------------------------
async function compileBuild() {
    try {
        const bundle = await rollup.rollup({
            input: 'src/js/index.js',
            onwarn: (warning, rollupWarn) => {
                // Suppress circular dependency spam.
                if (warning.code !== 'CIRCULAR_DEPENDENCY') {
                    rollupWarn(warning);
                }
            }
        });

        await bundle.write({
            file: 'dist/temp/app.js',
            format: 'iife',
            name: 'app',
            sourcemap: "inline"
        });
    } catch (error) {
        // Use rollup's error output
        require('rollup/dist/shared/loadConfigFile').handleError(error, true);
        throw error;
    }
}

function minifyBuild() {
    // Fast Mode Shortcut
    if (fast) return Promise.resolve();

    let cache = {};

    return gulp.src('dist/temp/app.js')
        .pipe(sourcemaps.init())
        // Phase 1: Mangle all props except DOM & built-ins. (Reserved props are built-ins
        // that terser doesn't know about yet, but which will break the game if they get mangled.)
        .pipe(terser({
            toplevel: true,
            nameCache: cache,
            mangle: {
                properties: {
                    reserved: ['imageSmoothingEnabled']
                }
            }
        }))
        // Phase 2: Specifically target properties we know match builtins but that
        // we can still safely mangle (because we don't refer to the builtin).
        .pipe(terser({
            nameCache: cache,
            mangle: {
                properties: {
                    builtins: true,
                    regex: /behavior|direction|frame|reset|update|anchor/
                }
            }
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('dist/temp'));
}

const buildJs = gulp.series(compileBuild, minifyBuild);

// -----------------------------------------------------------------------------
// CSS Build
// -----------------------------------------------------------------------------
function buildCss() {
    return gulp.src('src/css/*.css')
        .pipe(concat('app.css'))
        .pipe(cleancss())
        .pipe(gulp.dest('dist/temp'));
}

// -----------------------------------------------------------------------------
// Assets Build
// -----------------------------------------------------------------------------
async function exportSpriteSheet() {
    // Exporting the sprite sheet is the first step - using Aseprite, we take as input
    // all of our source aseprite files, and spit out a single spritesheet PNG and a JSON
    // file containing the x/y/w/h coordinates of the sprites in the spritesheet.

    let src = 'src/assets/*.aseprite';
    let png = 'src/assets/spritesheet-gen.png';
    let data = 'src/assets/spritesheet-gen.json';

    try {
        await AsepriteCli.exec(`--batch ${src} --sheet-type rows --sheet ${png} --data ${data} --format json-array`);
    } catch (e) {
        log.error(e);
        log.warn(chalk.red('Failed to update sprite sheet, but building anyway...'));
    }
}

async function generateSpriteSheetData() {
    // After exporting the sprite sheet, we use the JSON data to update a source file used by
    // our asset loader in the game. This way we can freely update images without ever
    // hand-edting any coordinate data or worrying about the composition of the spritesheet.

    let data = 'src/assets/spritesheet-gen.json';
    let output = 'src/js/SpriteSheet-gen.js';

    await ImageDataParser.parse(data, output);
}

function copyAssets() {
    let pipeline = gulp.src('src/assets/spritesheet-gen.png')
        .pipe(size({ title: 'spritesheet  pre' }));

    // Fast Mode Shortcut
    if (!fast) {
        pipeline = pipeline
        .pipe(imagemin())
        .pipe(imagemin([
            advpng({ optimizationLevel: 4, iterations: 20 })
        ]));
    }

    return pipeline
        .pipe(size({ title: 'spritesheet post' }))
        .pipe(rename("sprites.png"))
        .pipe(gulp.dest('dist/build'));
}

async function generateMapData() {
    let data = 'src/maps/map.aseprite';
    let output = 'src/js/Map-gen.js';

    await MapDataParser.parse(data, output);
}

const refreshAssets = gulp.series(exportSpriteSheet, generateSpriteSheetData, generateMapData);

const buildAssets = gulp.series(refreshAssets, copyAssets);

// -----------------------------------------------------------------------------
// HTML Build
// -----------------------------------------------------------------------------
function buildHtml() {
    const cssContent = fs.readFileSync('dist/temp/app.css');
    const jsContent = fs.readFileSync('dist/temp/app.js');

    return gulp.src('src/index.html')
        .pipe(template({ css: cssContent, js: jsContent }))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.src('dist/temp/app.js.map'))
        .pipe(gulp.dest('dist/build'));
}

// -----------------------------------------------------------------------------
// ZIP Build
// -----------------------------------------------------------------------------
function buildZip() {
    let s;

    // Fast Mode Shortcut
    if (fast) return Promise.resolve();

    return gulp.src(['dist/build/*', '!dist/build/*.map'])
        .pipe(size())
        .pipe(zip('js13k-2020.zip'))
        .pipe(advzip({ optimizationLevel: 4, iterations: 200 }))
        .pipe(s = size({ title: 'zip' }))
        .pipe(gulp.dest('dist/final'))
        .on('end', () => {
            let remaining = (13 * 1024) - s.size;
            if (remaining < 0) {
                log.warn(chalk.red(`${-remaining} bytes over`));
            } else {
                log.info(chalk.green(`${remaining} bytes remaining`));
            }
        });
}

// -----------------------------------------------------------------------------
// Build
// -----------------------------------------------------------------------------
async function ready() {
    if (watching) {
        childProcess.exec('say OK');
    }
}

const build = gulp.series(
    buildAssets,
    buildJs,
    buildCss,
    buildHtml,
    ready,
    buildZip
);

// -----------------------------------------------------------------------------
// Watch
// -----------------------------------------------------------------------------
function watch() {
    watching = true;

    // The watch task watches for any file changes in the src/ folder, _except_ for
    // edits to generated files (called blah-gen by convention).
    gulp.watch(['src/**', '!src/**/*-gen*'], build);
}

// -----------------------------------------------------------------------------
// Task List
// -----------------------------------------------------------------------------
module.exports = {
    // Potentially useful subtasks
    compileBuild,
    minifyBuild,
    refreshAssets,

    // Core build steps
    buildJs,
    buildCss,
    buildAssets,
    buildHtml,
    buildZip,

    // Primary entry points
    build,
    watch,

    default: gulp.series(build, watch)
};
