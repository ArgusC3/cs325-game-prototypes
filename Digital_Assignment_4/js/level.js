import "./phaser.js";
import {shared} from "./main.js";
import {Menu} from "./main.js";

// You can copy-and-paste the code from any of the examples at https://examples.phaser.io here.
// You will need to change the `parent` parameter passed to `new Phaser.Game()` from
// `phaser-example` to `game`, which is the id of the HTML element where we
// want the game to go.
// The assets (and code) can be found at: https://github.com/photonstorm/phaser3-examples
// You will need to change the paths you pass to `this.load.image()` or any other
// loading functions to reflect where you are putting the assets.
// All loading functions will typically all be found inside `preload()`.

// The simplest class example: https://phaser.io/examples/v3/view/scenes/scene-from-es6-class

// https://github.com/photonstorm/phaser3-examples/blob/master/public/src/input/keyboard/add%20key.js
// https://phaser.io/tutorials/making-your-first-phaser-3-game/part1
// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/keyboardevents/
// https://labs.phaser.io/edit.html?src=src/camera/follow%20zoom.js&v=3.52.0
// https://medium.com/@michaelwesthadley/modular-game-worlds-in-phaser-3-tilemaps-1-958fc7e6bbd6
// https://github.com/mikewesthad/phaser-3-tilemap-blog-posts/blob/master/examples/post-1/05-physics/index.js
// https://labs.phaser.io/edit.html?src=src/scenes/changing%20scene%20es6.js&v=3.52.0
// https://medium.com/@alizah.lalani/collecting-objects-in-phaser-3-platformer-games-using-tiled-4e9298cbfc85
// https://phasergames.com/using-ladders-in-phaser-3/
// https://phaser.io/examples/v3/view/camera/camera-fade-in-and-out#
// https://phaser.io/examples/v3/view/scenes/passing-data-to-a-scene#

export class Level extends Phaser.Scene {

    constructor() {
        super("Level");
        this.speed = 75;
        this.score = 0;
        this.seeDist = 75;
        this.hiding = false;
        this.hitBound = false;
        this.gotTool = false;
        this.timeDelay = 1000 * 8;
        this.hour = 8;
        this.chance = 0;
        this.idleMovUp = false;
        this.idleMovDown = false;
        this.idleMovDist = 0;
    }

    preload() {
        this.load.image("stick", "assets/stick.png");
        this.load.image("tool", "assets/tool.png");
      this.load.image("tiles","assets/tiles.png");
      //this.load.image("item", "assets/item.png");
      this.load.tilemapTiledJSON("map", "assets/main_map.json");
      this.load.spritesheet("player", "assets/ranger.png", { frameWidth: 9, frameHeight: 23 });
      this.load.spritesheet("dark", "assets/dark.png", { frameWidth: 18, frameHeight: 32 });
    }

    create() {
        shared.setHour = 8;
        this.hour = shared.getHour;
        
      const map = this.make.tilemap({ key: "map" });

      const tileset = map.addTilesetImage("tiles", "tiles");

      const belowLayer = map.createLayer("below", tileset, 0, 0);
      const worldLayer = map.createLayer("world", tileset, 0, 0);
      this.aboveLayer = map.createLayer("above", tileset, 0, 0);
      this.hideLayer = map.getObjectLayer("Hide Points")["objects"];

      this.mapX = map.widthInPixels;
      this.mapY = map.heightInPixels;

      worldLayer.setCollisionByProperty({ collides: true });

      this.aboveLayer.setDepth(10);
      
      let x = Phaser.Math.Between(0, this.mapX);
      let y = Phaser.Math.Between(200, this.mapY);

      // Spawn creature at random y value
      const darkSpawn = map.findObject("Spawn", obj => obj.name === "Dark Spawn");
      this.dark = this.physics.add.sprite(darkSpawn.x, y, "dark");
    
      // Spawn Player
      const spawnPoint = map.findObject("Spawn", obj => obj.name === "Player Spawn");
      this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "player");
      
      // Create Cabin Door
      const cabinPoint = map.findObject("Spawn", obj => obj.name === "Door");
      this.cabin = this.physics.add.staticGroup();
      let door = this.cabin.create(cabinPoint.x, cabinPoint.y);
      door.body.width = 16;
      door.body.height = 24;
      door.setVisible(false);

      const camera = this.cameras.main;
      camera.startFollow(this.player, false);
      camera.setZoom(4);
      camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

      this.cursors = this.input.keyboard.createCursorKeys();

      this.playerAnims();
      this.darkAnims();

      this.physics.add.overlap(this.player, this.dark, this.dead, null, this);
      this.physics.add.collider(this.player, worldLayer);
      //this.player.setCollideWorldBounds(true);
      
      this.hide = this.physics.add.staticGroup()
      this.hideLayer.forEach(object => {
        let obj = this.hide.create(object.x, object.y);
        obj.body.width = 24;
        obj.body.height = 24;
        obj.setVisible(false);
      });
      
      x = Phaser.Math.Between(10, this.mapX - 10);
      y = Phaser.Math.Between(200, this.mapY - 10);
      this.tool = this.physics.add.sprite(x, y, "tool");
      
      this.branches = this.physics.add.staticGroup();
      let i;
      for(i = 0; i < 5; i++) {
          x = Phaser.Math.Between(10, this.mapX - 10);
          y = Phaser.Math.Between(10, this.mapY - 10);
          this.branches.create(x, y, "stick");
      }
      
        this.physics.add.overlap(this.player, this.tool, this.collectItem, null, this);
        this.physics.add.overlap(this.player, this.branches, this.collectBranch, null, this);
        this.physics.add.overlap(this.player, this.cabin, this.enterCabin, null, this);
        
        this.hud();
        
        this.timer = this.time.addEvent({
            delay: this.timeDelay,
            callback: this.timeCount,
            callbackScope: this,
            loop: true
        });
        
        camera.fadeIn(4000);
    }
    
    hud() {
        this.toolMarker = this.add.image(315, 240, "tool").setScrollFactor(0);
        this.toolMarker.setVisible(false);
        
        this.stickMarker = this.add.image(315, 260, "stick").setScrollFactor(0);
        this.stickNum = this.add.text(325, 255, "x" + shared.branches, { fontSize: '12px', fill: '#FFF' }).setScrollFactor(0);
        
        this.timeText = this.add.text(455, 230, this.hour + ":00", { fontSize: '12px', fill: '#FFF' }).setScrollFactor(0);
        this.dayText = this.add.text(455, 240, "Day " + shared.getDay, { fontSize: '12px', fill: '#FFF' }).setScrollFactor(0);
        
        this.toolMarker.setDepth(20);
        this.stickMarker.setDepth(20);
        this.stickNum.setDepth(20);
        this.timeText.setDepth(20);
    }
    
    timeCount() {
        shared.setHour = shared.getHour + 1;
        if(shared.getHour > 12) {
            this.hour = shared.getHour - 12; 
        }
        else {
            this.hour = shared.getHour;
        }
        
        this.timeText.setText(this.hour + ":00");
        
        if(shared.getHour == 16) {
            this.cameras.main.fadeOut(4 * this.timeDelay);
        }
        
        if(shared.getHour >= 20) {
            console.log("dead");
            this.scene.start("SceneLose", { loseText: "You were out after sundown, the creature got you." });
        }
    }

    dead() {
        if(!this.hiding) {
            console.log("dead");
            this.scene.start("SceneLose", { loseText: "The creature got you." });
        }
    }

    collectItem(player, item) {
        item.destroy(item.x, item.y);
        this.toolMarker.setVisible(true);
        this.gotTool = true;
        console.log("Got tool");
    }
    
    collectBranch(player, item) {
        item.destroy(item.x, item.y);
        shared.setBranches = shared.branches + 1;
        this.stickNum.setText("x" + shared.branches);
        console.log("Got branch");
    }
    
    enterCabin() {
        if(this.gotTool) {
            this.nextDay();
        }
    }
    
    nextDay() {
        shared.setBranches = shared.branches - (shared.getDay * 2);
        if(shared.branches < 0) {
            this.scene.start("SceneLose", { loseText: "You did not have enough branches to barricade the door." });
            return;
        }
        
        shared.setDay = shared.getDay + 1;
        if(shared.getDay > 3) {
            this.scene.start("SceneWin");
            return;
        }
        
        this.scene.restart();
    }
    
    checkHiding() {
        if(this.physics.overlap(this.player, this.hide) && !this.hiding) {
            //console.log("hiding");
            this.hiding = true;
        }
        else if(!this.physics.overlap(this.player, this.hide) && this.hiding) {
            //console.log("stop hiding");
            this.hiding = false;
        }
    }

    update() {
        this.checkHiding();
        
      this.playerMovement();

      if(this.canSee()) {
        this.darkMovement();
      }
      else {
        this.darkIdle();
      }

      if(this.score >= 10) {
        this.scene.start("SceneWin");
      }
    }

    darkAnims() {
      this.anims.create({
        key: "dRight",
        frames: [ { key: "dark", frame: 1 } ],
        frameRate: 10,
      });

      this.anims.create({
        key: "dLeft",
        frames: [ { key: "dark", frame: 2 } ],
        frameRate: 10,
      });

      this.anims.create({
        key: "dBack",
        frames: [ { key: "dark", frame: 3 } ],
        frameRate: 10
      });

      this.anims.create({
        key: "dFront",
        frames: [ { key: "dark", frame: 0 } ],
        frameRate: 10
      });
    }

    playerAnims() {
      this.anims.create({
        key: "walk right",
        frames: this.anims.generateFrameNumbers("player", { start: 1, end: 2 }),
        frameRate: 10,
        repeat: -1
      });

      this.anims.create({
        key: "walk left",
        frames: this.anims.generateFrameNumbers("player", { start: 6, end: 7 }),
        frameRate: 10,
        repeat: -1
      });

      this.anims.create({
        key: "back",
        frames: [ { key: "player", frame: 3 } ],
        frameRate: 10
      });

      this.anims.create({
        key: "front",
        frames: [ { key: "player", frame: 0 } ],
        frameRate: 10
      });

      this.anims.create({
        key: "walk back",
        frames: this.anims.generateFrameNumbers("player", { start: 4, end: 5 }),
        frameRate: 10,
        repeat: -1
      });
    }

    darkMovement() {
      this.dark.setVelocity(0,0);
      //this.dark.anims.play("dFront", true);

      if(this.dark.x < this.player.x) {
        this.dark.setVelocityX(this.speed);
      }
      else if(this.dark.x > this.player.x) {
        this.dark.setVelocityX(-this.speed);
      }

      if(this.dark.y < this.player.y) {
        this.dark.setVelocityY(this.speed);
      }
      else if(this.dark.y > this.player.y) {
        this.dark.setVelocityY(-this.speed);
      }

      this.dark.body.velocity.normalize().scale(this.speed);

      if(this.dark.x < this.player.x) {
        this.dark.anims.play("dRight", true);
      }
      else if(this.dark.x > this.player.x) {
        this.dark.anims.play("dLeft", true);
      }
      else if(this.dark.y > this.player.y) {
        this.dark.anims.play("dBack", true);
      }
      else if(this.dark.y < this.player.y) {
        this.dark.anims.play("dFront", true);
      }
      else {
        this.dark.anims.stop();
      }

    }

    darkIdle() {
      if(this.dark.x >= this.mapX) {
        this.hitBound = true;
      }
      else if(this.dark.x <= 0) {
        this.hitBound = false;
      }
      
      this.chance = Phaser.Math.Between(0, 150);
      if(!this.idleMovDown && !this.idleMovUp &&this.chance == 3) {
          //console.log("moving down");
          this.idleMovDown = true;
          this.idleMovDist = this.dark.y + 50;
      }
      else if(!this.idleMovUp && !this.idleMovDown && this.chance == 6) {
          //console.log("moving up");
          this.idleMovUp = true;
          this.idleMovDist = this.dark.y - 50;
      }
      
      if(this.idleMovDown && this.dark.y < this.idleMovDist) {
          this.dark.setVelocityY(this.speed);
          this.dark.anims.play("dFront", true);
      }
      else if(this.idleMovDown && (this.dark.y >= this.idleMovDist || this.dark.y >= 550)) {
          //console.log("stop");
          this.idleMovDown = false;
      }
      
      if(this.idleMovUp && this.dark.y > this.idleMovDist) {
          this.dark.setVelocityY(-this.speed);
          this.dark.anims.play("dBack", true);
      }
      else if(this.idleMovUp && (this.dark.y <= this.idleMovDist || this.dark.y <= 300)) {
          //console.log("stop");
          this.idleMovUp = false;
      }
      
      

      if(!this.hitBound && !this.idleMovUp && !this.idleMovDown) {
        this.dark.setVelocityX(this.speed);
        this.dark.anims.play("dRight", true);
      }
      else if(this.hitBound && !this.idleMovUp && !this.idleMovDown) {
        this.dark.setVelocityX(-this.speed);
        this.dark.anims.play("dLeft", true);
      }
    }

    playerMovement() {
      this.player.setVelocity(0);
      //this.player.anims.play("front");

      if( this.cursors.left.isDown ) {
        this.player.setVelocityX(-this.speed);
      }
      else if( this.cursors.right.isDown ) {
        this.player.setVelocityX(this.speed);
      }        


      if( this.cursors.down.isDown ) {
        this.player.setVelocityY(this.speed);
      }
      else if( this.cursors.up.isDown ) {
        this.player.setVelocityY(-this.speed);
      }


      this.player.body.velocity.normalize().scale(this.speed);

      if( this.cursors.left.isDown ) {
        this.player.anims.play("walk left", true);
      }
      else if( this.cursors.right.isDown ) {
        this.player.anims.play("walk right", true);
      }
      else if( this.cursors.down.isDown ) {
        this.player.anims.play("walk right", true);
      }
      else if( this.cursors.up.isDown ) {
        this.player.anims.play("walk back", true);
      }
      else {
        this.player.anims.stop();
      }
    }

    canSee() {
      let dist = Phaser.Math.Distance.Between(this.dark.x, this.dark.y, this.player.x, this.player.y);
      if( dist < this.seeDist && !this.hiding ) { return true; }
      this.dark.setVelocity(0,0);
      this.dark.anims.play("dFront", true);
      return false;
    }

}

export class SceneWin extends Phaser.Scene {

  constructor() {
    super({ key: "SceneWin" });
  }

  preload() {

  }

  create() {
    this.add.text(400, 300, "YOU SURVIVED", { fontSize: '32px', fill: '#FFF' });
    this.add.text(400, 400, "Click anywhere to return to menu", { fontSize: '14px', fill: '#FFF' });
    this.input.on("pointerup", () => { this.scene.start("Menu"); }, this);
  }
}

export class SceneLose extends Phaser.Scene {
  constructor() {
    super({ key: "SceneLose" });
  }
  
  init(data) {
    this.loseText = data.loseText;
  }

  preload() {
    
  }

  create() {
    this.add.text(200, 300, "YOU DIED", { fontSize: '32px', fill: '#FFF' });
    this.add.text(200, 350, this.loseText, { fontSize: '14px', fill: '#FFF' });
    this.add.text(300, 450, "Click anywhere to return to menu", { fontSize: '14px', fill: '#FFF' });
    this.input.on("pointerup", () => { this.scene.start("Menu"); }, this);
  }
}400

/*
const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    scene: [MyScene, SceneWin, SceneLose],
    pixelArt: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 0 },
        debug: false
        }
    }
});
*/