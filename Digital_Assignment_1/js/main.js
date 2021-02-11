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

class MyScene extends Phaser.Scene {

    constructor() {
        super();
        this.score = 0;
        this.speed = 300;
        this.jump = 600;
        this.bounce = 0.5;
    }

    preload() {
      this.load.image('platform', 'assets/platform.png');
      this.load.spritesheet('player1', 'assets/player1.png', {frameWidth: 80, frameHeight: 80});
      this.load.spritesheet('player2', 'assets/player2.png', {frameWidth: 80, frameHeight: 80});
    }

    create() {
      //Platforms Setup
      this.platforms = this.physics.add.staticGroup();
      this.platforms.create(400, 600, 'platform').setScale(2.5).refreshBody();
      this.platforms.create(0, 400, 'platform');
      this.platforms.create(800, 400, 'platform');
      this.platforms.create(400, 200, 'platform');

      //Player 1 Setup
      this.player1 = this.physics.add.sprite(400, 400, 'player1');
      this.player1.setBounce(this.bounce);
      this.player1.setCollideWorldBounds(true);
      this.player1.setDrag(0.5,0.5);
      this.player1.setDamping(true);
      //Player 1 Keys
      this.P1Up = this.input.keyboard.addKey('up');
      this.P1Left = this.input.keyboard.addKey('left');
      this.P1Right = this.input.keyboard.addKey('right');

      //Player 2 Setup
      this.player2 = this.physics.add.sprite(600, 400, 'player2');
      this.player2.setBounce(this.bounce);
      this.player2.setCollideWorldBounds(true);
      this.player2.setDrag(0.5,0.5);
      this.player2.setDamping(true);
      //Player 2 Keys
      this.P2Up = this.input.keyboard.addKey('W');
      this.P2Left = this.input.keyboard.addKey('A');
      this.P2Right = this.input.keyboard.addKey('D');

      //Colliders
      this.physics.add.collider(this.player1, this.platforms);
      this.physics.add.collider(this.player2, this.platforms);
      this.physics.add.collider(this.player1, this.player2);
    }

    update() {
      if(this.P1Left.isDown) {
          this.player1.setVelocityX(-this.speed);
      }
      if(this.P1Right.isDown) {
          this.player1.setVelocityX(this.speed);
      }
      if(this.P1Up.isDown && this.player1.body.touching.down) {
          this.player1.setVelocityY(-this.jump);
      }

      if(this.P2Left.isDown) {
          this.player2.setVelocityX(-this.speed);
      }
      if(this.P2Right.isDown) {
          this.player2.setVelocityX(this.speed);
      }
      if(this.P2Up.isDown && this.player2.body.touching.down) {
          this.player2.setVelocityY(-this.jump);
      }


    }



    score() {
        this.score++;
        this.player1.setFrame(this.score);
    }
}

const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 800,
    height: 600,
    scene: MyScene,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 300 },
        debug: false
        }
    }
});
