import "./phaser.js";
import {shared} from "./main.js";

// You can copy-and-paste the code from any of the examples at https://examples.phaser.io here.
// You will need to change the `parent` parameter passed to `new Phaser.Game()` from
// `phaser-example` to `game`, which is the id of the HTML element where we
// want the game to go.
// The assets (and code) can be found at: https://github.com/photonstorm/phaser3-examples
// You will need to change the paths you pass to `this.load.image()` or any other
// loading functions to reflect where you are putting the assets.
// All loading functions will typically all be found inside `preload()`.

// The simplest class example: https://phaser.io/examples/v3/view/scenes/scene-from-es6-class

// https://labs.phaser.io/edit.html?src=src/camera/set%20scroll%20factor.js&v=3.52.0
// https://labs.phaser.io/edit.html?src=src/time\timer%20event.js
// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/timer/


export class Level extends Phaser.Scene {

    constructor() {
        super("Level");
        this.speed = 100;
        this.jump = 200;
        this.score = 0;
        this.timeDelay = 1000 * 10;
    }

    preload() {
      this.load.image("pot", "assets/pot.png");
      this.load.image("sky", "assets/sky.png");
      this.load.image("dirt_tiles","assets/dirt_tiles.png");
      this.load.tilemapTiledJSON("level_map", "assets/level_map.json");
      this.load.spritesheet("player", "assets/ranger.png", { frameWidth: 9, frameHeight: 23 });
    }

    create() {
      if( shared.found ){
        console.log("found");
        shared.setHour = shared.getHour + 2;
        this.levelCreate();
      }
      else {
        this.add.text(100, 200, "Unfortunately, the test pit\nrevealed nothing.\n\nClick anywhere to return.", { fontSize: '32px', fill: '#FFF' });
        shared.setHour = shared.getHour + 2;
        this.input.on("pointerup", () => { this.scene.start("Select"); }, this);
      }
    }

    levelCreate() {
      this.add.image(400, 300, "sky");

      const map = this.make.tilemap({ key: "level_map" });

      const tileset = map.addTilesetImage("dirt_tiles", "dirt_tiles");

      const belowLayer = map.createLayer("back", tileset, 0, 0);
      const platformLayer = map.createLayer("platforms", tileset, 0, 0);
      this.itemLayer = map.getObjectLayer("items")["objects"];

      platformLayer.setCollisionByProperty({ collides: true });

      const spawnPoint = map.findObject("spawn", obj => obj.name === "spawn point");
      this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "player");
      this.player.setCollideWorldBounds(true);
      //this.player.body.setGravityY(500);
      this.physics.add.collider(this.player, platformLayer);

      const camera = this.cameras.main;
      camera.startFollow(this.player, false, 0.1, 0.1);
      camera.setZoom(3);
      camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

      this.items = this.physics.add.staticGroup()
      this.itemLayer.forEach(object => {
        let obj = this.items.create(object.x, object.y, "pot");
        obj.body.width = 11;
        obj.body.height = 13;
      });

      this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

      this.scoreText = this.add.text(275, 200, "Score:" + this.score, { fontSize: '16px', fill: '#FFF' }).setScrollFactor(0);
      this.timeText = this.add.text(475, 200, shared.getHour + ":00", { fontSize: '16px', fill: '#FFF' }).setScrollFactor(0);

      this.timer = this.time.addEvent({
        delay: this.timeDelay,
        callback: this.timeCount,
        callbackScope: this,
        loop: true
      });

      this.cursors = this.input.keyboard.createCursorKeys();
    }

    collectItem(player, item) {
      item.destroy(item.x,item.y);
      this.score++;
      this.scoreText.setText("Score:" + this.score);
      
      if( this.score >= 8 ) {
          this.scene.start("SceneWin");
      }
    }

    timeCount() {
      shared.setHour = shared.getHour + 1;
      this.timeText.setText(shared.getHour + ":00");
      
      if( shared.getHour >= 16 )
      {
          this.scene.start("SceneLose");
      }
    }

    update() {
      if( shared.found ) { this.playerMovement(); }
    }

    playerMovement() {
      if( this.cursors.left.isDown ) {
        this.player.setVelocityX(-this.speed);
      }
      else if( this.cursors.right.isDown ) {
        this.player.setVelocityX(this.speed);
      }
      else {
        this.player.setVelocityX(0);
      }

      if(this.cursors.up.isDown && this.player.body.blocked.down) {
          this.player.setVelocityY(-this.jump);
      }

      //this.player.body.velocity.normalize().scale(this.speed);
      /*
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
      */
    }
}

class SceneWin extends Phaser.Scene {

  constructor() {
    super({ key: "SceneWin" });
  }

  preload() {

  }

  create() {
    this.add.text(100, 300, "You collected all of the Arifacts.", { fontSize: '20px', fill: '#FFF' });
  }
}

class SceneLose extends Phaser.Scene {
  constructor() {
    super({ key: "SceneLose" });
  }

  preload() {

  }

  create() {

    this.add.text(100, 300, "Unfortunately you didn't find\nall of the Artifacts in time.", { fontSize: '20px', fill: '#FFF' });

  }
}
