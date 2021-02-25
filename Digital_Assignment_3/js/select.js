import "./phaser.js";
import {shared} from "./main.js";
import "./level.js"

// You can copy-and-paste the code from any of the examples at https://examples.phaser.io here.
// You will need to change the `parent` parameter passed to `new Phaser.Game()` from
// `phaser-example` to `game`, which is the id of the HTML element where we
// want the game to go.
// The assets (and code) can be found at: https://github.com/photonstorm/phaser3-examples
// You will need to change the paths you pass to `this.load.image()` or any other
// loading functions to reflect where you are putting the assets.
// All loading functions will typically all be found inside `preload()`.

// The simplest class example: https://phaser.io/examples/v3/view/scenes/scene-from-es6-class
// https://itnext.io/modular-game-worlds-in-phaser-3-tilemaps-2-dynamic-platformer-3d68e73d494a
//    https://codesandbox.io/s/31xpvv85om?from-embed=&file=/js/index.js
// https://phasergames.com/adding-message-box-phaser-games/
// https://snowbillr.github.io/blog//2018-07-03-buttons-in-phaser-3/
// https://labs.phaser.io/edit.html?src=src%5Cscenes%5Cdrag%20scenes%20demo.js
// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/scenemanager/#add-new-scene


export class Load extends Phaser.Scene {

    constructor() {
        super("Load");
    }

    preload() {
      this.load.image("sat_map1", "assets/sat_map1.png");
      this.load.image("geo_map1", "assets/geo_map1.png");
    }

    create() {
      this.add.image(400, 300, "sat_map1");
      this.map = this.physics.add.sprite(400, -300, "geo_map1").body.setAllowGravity(false);
      this.map.setVelocityY(100);
    }

    update() {
      if( this.map.y >= 0 ) {
        this.scene.start("Select");
      }
    }
}

export class Select extends Phaser.Scene {

    constructor() {
        super("Select");
        this.found = false;
    }

    preload() {
      this.load.image("empty", "assets/empty.png");
      this.load.image("popup_window", "assets/popup.png");
      this.load.image("ok_button", "assets/ok.png");
      this.load.image("cancel_button", "assets/cancel.png");
      this.load.image("geo_map1", "assets/geo_map1.png");
      this.load.tilemapTiledJSON("map", "assets/select_map.json");
    }

    create() {
      shared.setFound = false;

      const map = this.make.tilemap({ key: "map" });

      const tileset = map.addTilesetImage("geo_map1", "geo_map1");

      this.mapLayer = map.createLayer("Tile Layer 1", tileset, 0, 0);
      this.selectLayer = map.getObjectLayer("select")["objects"];

      this.marker = this.add.graphics();
      this.marker.fillStyle(0xf4fc03, 0.5);
      this.marker.fillRect(0, 0, map.tileWidth, map.tileHeight);

      this.items = this.physics.add.staticGroup()
      this.selectLayer.forEach(object => {
        let obj = this.items.create(object.x, object.y, "empty");
        obj.setOrigin(0);
        obj.body.width = map.tileWidth;
        obj.body.height = map.tileHeight;
        obj.setInteractive();
        obj.on("pointerdown", () => { shared.setFound = true; }, this);
      });

      this.startupPopup();

      this.input.on("pointerup", this.selectPopup, this);
    }

    update() {
      this.pointer();
    }

    startupPopup() {
      let handle = "window1";
      let popup = this.add.zone(400, 300, 400, 200).setInteractive();
      let demo = new PopupStart(handle, popup);

      this.scene.add(handle, demo, true);
      this.scene.pause();
    }

    selectPopup() {
      let handle = "window2";
      let popup = this.add.zone(400, 300, 400, 200).setInteractive();
      let demo = new PopupSelect(handle, popup);

      this.scene.add(handle, demo, true);
      this.scene.pause();
    }

    pointer() {
      // Convert the mouse position to world position within the camera
      const worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

      // Place the marker in world space, but snap it to the tile grid. If we convert world -> tile and
      // then tile -> world, we end up with the position of the tile under the pointer
      const pointerTileXY = this.mapLayer.worldToTileXY(worldPoint.x, worldPoint.y);
      const snappedWorldPoint = this.mapLayer.tileToWorldXY(pointerTileXY.x, pointerTileXY.y);
      this.marker.setPosition(snappedWorldPoint.x, snappedWorldPoint.y);


    }
}

class PopupStart extends Phaser.Scene {
    constructor(handle, parent) {
      super(handle);400
      this.parent = parent;
    }

    create() {
      let popup = this.add.container(400, 300);
      let window = this.add.image(0, 0, "popup_window");
      let okButton = this.add.image(0, 50, "ok_button");
      let day = this.add.text(-190, -90, "Day " + shared.getDay, { fontSize: "20px", fill: "#000"});
      let time = this.add.text(130, -90, shared.getHour + ":00", { fontSize: "20px", fill: "#000"});
      let info = this.add.text(-190, -20, "Select a tile to dig a test pit.", { fontSize: "20px", fill: "#000"});

      popup.add([window, okButton, info, day, time]);

      okButton.setInteractive();
      okButton.on("pointerup", () => {
        this.scene.resume("Select");
        this.scene.remove();
      });
    }
}


class PopupSelect extends Phaser.Scene {
    constructor(handle, parent) {
      super(handle);
      this.parent = parent;
      this.found = false;
    }

    create() {
      let popup = this.add.container(400, 300);
      let window = this.add.image(0, 0, "popup_window");
      let okButton = this.add.image(-60, 50, "ok_button");
      let cancelButton = this.add.image(60, 50, "cancel_button");
      let day = this.add.text(-190, -90, "Day " + shared.getDay, { fontSize: "20px", fill: "#000"});
      let time = this.add.text(130, -90, shared.getHour + ":00", { fontSize: "20px", fill: "#000"});
      let info = this.add.text(-140, -40, " Dig a test pit here?\nThis action costs time.", { fontSize: "20px", fill: "#000"});

      popup.add([window, okButton, cancelButton, info, day, time]);

      cancelButton.setInteractive();
      cancelButton.on("pointerup", () => {
        this.scene.resume("Select");
        this.scene.remove();
      });

      okButton.setInteractive();
      okButton.on("pointerup", () => {
        this.scene.start("Level");
        this.scene.stop("Select");
        this.scene.remove();
      });
    }
}

