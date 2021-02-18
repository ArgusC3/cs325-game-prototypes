import "./phaser.js";

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

class MyScene extends Phaser.Scene {

    constructor() {
        super({ key: "MyScene" });
        this.speed = 75;
        this.score = 0;
        this.seeDist = 75;
        this.hiding = false;
        this.hitBound = false;
    }

    preload() {
      this.load.image("tiles","assets/tiles.png");
      this.load.image("item", "assets/item.png");
      this.load.tilemapTiledJSON("map", "assets/DA2.json");
      this.load.spritesheet("player", "assets/ranger.png", { frameWidth: 9, frameHeight: 25 });
      this.load.spritesheet("dark", "assets/dark.png", { frameWidth: 18, frameHeight: 32 });
    }

    create() {
      const map = this.make.tilemap({ key: "map" });

      const tileset = map.addTilesetImage("tiles", "tiles");

      const belowLayer = map.createLayer("Below", tileset, 0, 0);
      const worldLayer = map.createLayer("World", tileset, 0, 0);
      this.aboveLayer = map.createLayer("Above", tileset, 0, 0);
      this.itemLayer = map.getObjectLayer("items")["objects"];

      this.mapX = map.widthInPixels;
      this.mapY = map.heightInPixels;

      worldLayer.setCollisionByProperty({ collides: true });
      this.aboveLayer.setCollisionByProperty({ hide: true });

      this.aboveLayer.setDepth(10);

      const darkSpawn = map.findObject("Objects", obj => obj.name === "Dark Spawn");
      this.dark = this.physics.add.sprite(darkSpawn.x, darkSpawn.y, "dark");

      const spawnPoint = map.findObject("Objects", obj => obj.name === "Spawn Point");
      this.player = this.physics.add.sprite(spawnPoint.x, spawnPoint.y, "player");

      const camera = this.cameras.main;
      camera.startFollow(this.player, false, 0.03, 0.03);
      camera.setZoom(4);
      camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

      this.cursors = this.input.keyboard.createCursorKeys();

      this.playerAnims();
      this.darkAnims();

      this.physics.add.overlap(this.player, this.dark, this.dead, null, this);
      this.physics.add.collider(this.player, worldLayer);
      //this.player.setCollideWorldBounds(true);

      this.items = this.physics.add.staticGroup()
      this.itemLayer.forEach(object => {
        let obj = this.items.create(object.x, object.y, "item");
        //obj.setScale(32, 32);
        obj.setOrigin(0);
        obj.body.width = 32;
        obj.body.height = 32;
      });

      this.physics.add.overlap(this.player, this.items, this.collectItem, null, this);

    }

    dead() {
      console.log("dead");
      this.scene.start("SceneLose")
    }

    collectItem(player, item) {
      item.destroy(item.x,item.y);
      this.score++;
    }

    update() {
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

      if(!this.hitBound) {
        this.dark.setVelocityX(this.speed);
        this.dark.anims.play("dRight", true);
      }
      else {
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
      if( dist < this.seeDist ) { return true; }
      this.dark.setVelocity(0,0);
      this.dark.anims.play("dFront", true);
      return false;
    }

}

class SceneWin extends Phaser.Scene {

  constructor() {
    super({ key: "SceneWin" });
  }

  preload() {

  }

  create() {
    this.add.text(400, 300, "YOU WON", { fontSize: '32px', fill: '#FFF' });
  }
}

class SceneLose extends Phaser.Scene {
  constructor() {
    super({ key: "SceneLose" });
  }

  preload() {

  }

  create() {

    this.add.text(400, 300, "YOU DIED", { fontSize: '32px', fill: '#FFF' });

  }
}

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
