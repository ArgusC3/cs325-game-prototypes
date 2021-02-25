import "./phaser.js";
import {Load} from "./select.js"
import {Select} from "./select.js"
import {Level} from "./level.js"

// https://hertsgeosurvey.wordpress.com/category/ashwell-end/
// https://hertsgeosurvey.files.wordpress.com/2014/07/ashwell-day-5-gb-only.jpg

export var shared = {
  day: 1,
  get getDay() { return this.day; },
  set setDay(x) { this.day = x; },
  hour: 8,
  get getHour() { return this.hour; },
  set setHour(x) { this.hour = x; },
  found: false,
  set setFound(x) { this.found = x; }
  };

// You can copy-and-paste the code from any of the examples at https://examples.phaser.io here.
// You will need to change the `parent` parameter passed to `new Phaser.Game()` from
// `phaser-example` to `game`, which is the id of the HTML element where we
// want the game to go.
// The assets (and code) can be found at: https://github.com/photonstorm/phaser3-examples
// You will need to change the paths you pass to `this.load.image()` or any other
// loading functions to reflect where you are putting the assets.
// All loading functions will typically all be found inside `preload()`.

// The simplest class example: https://phaser.io/examples/v3/view/scenes/scene-from-es6-class

const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    scene: [Load, Select, Level],
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 },
        debug: false
        }
    },
    pixelArt: true
    });
