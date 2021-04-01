import "./phaser.js";

// https://phasergames.com/extend-a-sprite-in-phaser-3/?mc_cid=3f4ee26e5d&mc_eid=a4d9ee0291
// https://www.html5gamedevs.com/topic/37547-onkeyup-event-onup/
// http://labs.phaser.io/edit.html?src=src%5Cinput%5Ckeyboard%5Ckeydown.js
// https://www.w3schools.com/js/js_switch.asp
// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/gameobject/
// https://www.w3schools.com/js/js_arrays.asp


class MyScene extends Phaser.Scene {
    
    constructor() {
        super();
        this.offset = 130;
        this.playerUnits;
        this.enemyUnits;
        
        this.currentUnitNum = 0;
        this.activeUnit;
    }
    
    preload() {
        this.load.image("tiles","assets/DA6_Tiles.png");
        this.load.tilemapTiledJSON("map", "assets/DA6.json");
        
        this.load.image("infantry", "assets/Infantry.png");
        this.load.image("artillery", "assets/Artillery.png");
        this.load.image("cavalry", "assets/Cavalry.png");
        
        this.load.image("info", "assets/InfoWin.png");
    }
    
    create() {
        const map = this.make.tilemap({ key: "map" });
        const tileset = map.addTilesetImage("DA6_Tiles", "tiles");
        
        const baseLayer = map.createLayer("Base", tileset, this.offset, 0);
        const terrainLayer = map.createLayer("Terrain", tileset, this.offset, 0);
        this.terrainObj = map.getObjectLayer("TerrainObj")["objects"];
        
        let infoWindow = this.add.container(850, 200);
        let screen = this.add.image(0, 0, "info");
        this.unitName = this.add.text(-110, -75, "Unit: ", { fontSize: "20px", fill: "#FFCC00"});
        this.unitSpaces = this.add.text(-110, -25, "Moves Left: ", { fontSize: "20px", fill: "#FFCC00"});
        
        infoWindow.add([screen, this.unitName, this.unitSpaces]);
        
        this.mapX = map.widthInPixels;
        this.mapY = map.heightInPixels;
        
        this.hills = this.physics.add.staticGroup()
        this.swamps = this.physics.add.staticGroup()
        this.fort = this.physics.add.staticGroup()
        
        this.terrainObj.forEach(object => {
            if(object.name == "hill") {
                let obj = this.hills.create(object.x, object.y);
                obj.setOrigin(-4.5, 1.5);
                obj.body.width = 60;
                obj.body.height = 60;
                obj.setVisible(false);
            }
            else if(object.name == "swamp") {
                let obj = this.swamps.create(object.x, object.y);
                obj.setOrigin(-4.5, 1.5);
                obj.body.width = 60;
                obj.body.height = 60;
                obj.setVisible(false);
            }
            else {
                let obj = this.fort.create(object.x, object.y);
                obj.setOrigin(-4.5, 1.5);
                obj.body.width = 60;
                obj.body.height = 60;
                obj.setVisible(false);
            }
        });
        
        this.createPlayerUnits();
        this.createEnemyUnits();
        
        this.cursors = this.input.keyboard.createCursorKeys();
        
        this.input.keyboard.on('keyup-RIGHT', function (event) {
            this.playerMoveUnit("RIGHT");
        }, this);
        
        this.input.keyboard.on('keyup-LEFT', function (event) {
            this.playerMoveUnit("LEFT");
        }, this);
        
        this.input.keyboard.on('keyup-UP', function (event) {
            this.playerMoveUnit("UP");
        }, this);
        
        this.input.keyboard.on('keyup-DOWN', function (event) {
            this.playerMoveUnit("DOWN");
        }, this);
    }
    
    createPlayerUnits() {
        this.playerUnits = [];
        let i;
        let temp;
        let unitY = this.mapY - 30;
        let unitX = (this.offset + 60) - 30;
        
        // Three infantry units
        for(i = 1; i <= 3; i++) {
            temp = new Infantry({scene: this, x: unitX, y: unitY}, i, true);
            this.playerUnits.push(temp);
            unitX = unitX + 60;
        }
        
        // Two Artillery Units
        for(i = 1; i <= 2; i++) {
            temp = new Artillery({scene: this, x: unitX, y: unitY}, i, true);
            this.playerUnits.push(temp);
            unitX = unitX + 60;
        }
        
        // One Cavalry Unit
        temp = new Cavalry({scene: this, x: unitX, y: unitY}, i, true);
        this.playerUnits.push(temp);
    }
    
    createEnemyUnits() {
        this.enemyUnits = [];
        let i;
        let temp;
        let unitY = 30;
        let unitX = (this.offset + 60) - 30;
        
        // Three infantry units
        for(i = 1; i <= 3; i++) {
            temp = new Infantry({scene: this, x: unitX, y: unitY}, i, false);
            this.enemyUnits.push(temp);
            unitX = unitX + 60;false
        }
        
        unitX = unitX + 120
        
        // Two Artillery Units
        for(i = 1; i <= 2; i++) {
            temp = new Artillery({scene: this, x: unitX, y: unitY}, i, false);
            this.enemyUnits.push(temp);
            unitX = unitX + 60;
        }
        
        // One Cavalry Unit
        temp = new Cavalry({scene: this, x: unitX, y: unitY}, i, false);
        this.enemyUnits.push(temp);
    }
    
    playerMoveUnit(direction) {
        this.activeUnit = this.playerUnits[this.currentUnitNum];
        
        this.unitName.setText("Unit: " + this.activeUnit.getName());
        this.unitSpaces.setText("Moves Left: " + this.activeUnit.getSpacesLeft()); 
        
        switch(direction) {
            case "RIGHT":
                this.activeUnit.x += 60;
                this.activeUnit.incSpaces();
                break;
            case "LEFT":
                this.activeUnit.x -= 60;
                this.activeUnit.incSpaces();
                break;
            case "UP":
                this.activeUnit.y -= 60;
                this.activeUnit.incSpaces();
                break;
            case "DOWN":
                this.activeUnit.y += 60;
                this.activeUnit.incSpaces();
                break;
        }
        
        this.unitName.setText("Unit: " + this.activeUnit.getName());
        this.unitSpaces.setText("Moves Left: " + this.activeUnit.getSpacesLeft());
        
        if(this.activeUnit.hasMoved()) {
            console.log("max spaces");
            this.currentUnitNum++;
        }
        
        if(this.currentUnitNum > 5) {
            this.currentUnitNum = 0;
        }
    }
    
    update() {
        
    }
}

class Infantry extends Phaser.GameObjects.Sprite {
    constructor(config, id, playerUnit) {
        super(config.scene, config.x, config.y, "infantry");
        config.scene.add.existing(this);
        
        this.id = id
        this.playerUnit = playerUnit;
        this.maxMoves = 3;
        this.spacesMoved = 0;
    }
    
    hasMoved() {
        if(this.spacesMoved == this.maxMoves) {
            this.spacesMoved = 0;
            return true;
        }
        
        return false;
    }
    
    incSpaces() {
        this.spacesMoved++;
    }
    
    getName() {
        return "Infantry " + this.id;
    }
    
    getSpacesLeft() {
        return this.maxMoves - this.spacesMoved;
    }
}

class Artillery extends Phaser.GameObjects.Sprite {
    constructor(config, id, playerUnit) {
        super(config.scene, config.x, config.y, "artillery");
        config.scene.add.existing(this);
        
        this.id = id;
        this.playerUnit = playerUnit;
        this.maxMoves = 2;
        this.spacesMoved = 0;
    }
    
    hasMoved() {
        if(this.spacesMoved == this.maxMoves) {
            this.spacesMoved = 0;
            return true;
        }
        
        return false;
    }
    
    incSpaces() {
        this.spacesMoved++;
    }
    
    getName() {
        return "Artillery " + this.id;
    }
    
    getSpacesLeft() {
        return this.maxMoves - this.spacesMoved;
    }
}

class Cavalry extends Phaser.GameObjects.Sprite {
    constructor(config, id, playerUnit) {
        super(config.scene, config.x, config.y, "cavalry");
        config.scene.add.existing(this);
        
        this.id = id;
        this.playerUnit = playerUnit;
        this.maxMoves = 4;
        this.spacesMoved = 0;
    }
    
    hasMoved() {
        if(this.spacesMoved == this.maxMoves) {
            this.spacesMoved = 0;
            return true;
        }
        
        return false;
    }
    
    incSpaces() {
        this.spacesMoved++;
    }
    
    getName() {
        return "Cavalry " + this.id;
    }
    
    getSpacesLeft() {
        return this.maxMoves - this.spacesMoved;
    }
}

const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: 'game',
    width: 1000,
    height: 720,
    scene: MyScene,
    physics: { default: 'arcade' },
    });
