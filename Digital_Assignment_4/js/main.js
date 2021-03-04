import "./phaser.js";
import {Level} from "./level.js"
import {SceneWin} from "./level.js"
import {SceneLose} from "./level.js"

export var shared = {
  day: 1,
  get getDay() { return this.day; },
  set setDay(x) { this.day = x; },
  hour: 8,
  get getHour() { return this.hour; },
  set setHour(x) { this.hour = x; },
  tool: false,
  set foundTool(x) { this.tool = x; },
  branches: 0,
  set setBranches(x) { this.branches = x }
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

// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/video/
// https://ourcade.co/tools/phaser3-text-styler/

export class Menu extends Phaser.Scene {
    
    constructor() {
        super("Menu");
    }
    
    preload() {
        this.load.audio("menu_music", "assets/menu_music2.mp3");
        this.load.video( "video", "assets/DA4_Menu_Creepy.webm", "loadeddata", false, true);
    }
    
    create() {
        this.reset();
        
        this.bgVideo = this.add.video(400, 300, "video");
        
        this.bgVideo.play(true);
        
        this.sound.add("menu_music", { loop: false }).play();

        this.add.text(65, 75, "THREE NIGHTS IN THE WOODS", { fontSize: '46px', fill: '#FFF', stroke: '#000000', strokeThickness: 2 });
        
        let graphics = this.add.graphics({
            lineStyle: {
                width: 4,
                color: 0xf494949,
                alpha: 1
            },
            fillStyle: {
                color: 0x858585,
                alpha: 1
            }
        });
        
        let startButton = this.add.container(400, 200).setSize(200, 50);
        startButton.add(graphics.fillRect(-100, -25, 200, 50).strokeRoundedRect(-100, -25, 200, 50, 3));
        startButton.add(this.add.text(-40, -15, "Start", { fontSize: '28px', fill: '#FFF' }));
        
        startButton.setInteractive();
        startButton.on("pointerup", () => {
            this.scene.start("Level");
        });
        
        let graphics1 = this.add.graphics({
            lineStyle: {
                width: 4,
                color: 0xf494949,
                alpha: 1
            },
            fillStyle: {
                color: 0x858585,
                alpha: 1
            }
        });
        
        let instrButton = this.add.container(400, 300).setSize(200, 50);
        instrButton.add(graphics1.fillRect(-100, -25, 200, 50).strokeRoundedRect(-100, -25, 200, 50, 3));
        instrButton.add(this.add.text(-95, -15, "Instructions", { fontSize: '26px', fill: '#FFF' }));
        
        instrButton.setInteractive();
        instrButton.on("pointerup", () => {
            this.scene.start("Instructions");
        });
    }
    
    reset() {
        shared.setDay = 1;
        shared.setBranches = 0;
    }
    
    update() {
        if(!this.bgVideo.isPlaying()) {
            this.bgVideo.play(true);
        }
    }        
}


class Instructions extends Phaser.Scene {
    constructor() {
        super("Instructions");
    }
        
    preload() {
        this.load.image("instructions", "assets/instruction.png");
    }
    
    create() {
        this.add.image(400, 300, "instructions");
        
        this.input.on("pointerup", () => { this.scene.start("Menu"); }, this);
    }
}


const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    scene: [Menu, Level, Instructions, SceneLose, SceneWin],
    physics: {
      default: 'arcade'
    },
    pixelArt: true
    });
