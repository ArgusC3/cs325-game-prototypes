import "./phaser.js";

// https://phasergames.com/extend-a-sprite-in-phaser-3/?mc_cid=3f4ee26e5d&mc_eid=a4d9ee0291
// https://www.html5gamedevs.com/topic/37547-onkeyup-event-onup/
// http://labs.phaser.io/edit.html?src=src%5Cinput%5Ckeyboard%5Ckeydown.js
// https://www.w3schools.com/js/js_switch.asp
// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/gameobject/
// https://www.w3schools.com/js/js_arrays.asp
// https://phaser.discourse.group/t/delay-creation/1254
// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/keyboardevents/


class MyScene extends Phaser.Scene {
    
    constructor() {
        super();
        this.offset = 130;
        this.playerUnits;
        this.enemyUnits;
        
        this.currentUnitNum = 0;
        this.activeUnit;
        this.playerTurn = true;
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
        
        this.baseLayer = map.createLayer("Base", tileset, this.offset, 0);
        const terrainLayer = map.createLayer("Terrain", tileset, this.offset, 0);
        this.terrainObj = map.getObjectLayer("TerrainObj")["objects"];
        
        this.marker = this.add.graphics();
        this.marker.fillStyle(0xFFCC00, 0.5);
        this.marker.fillRect(0, 0, map.tileWidth, map.tileHeight);
        
        this.hitMarker = this.add.graphics();
        this.hitMarker.fillStyle(0xFFB000, 0.5);
        this.hitMarker.fillRect(0, 0, map.tileWidth, map.tileHeight);
        this.hitMarker.setVisible(false);
        
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
        this.unitInfoScreen();
        
        this.turnText = this.add.text(this.mapX + this.offset + 50, 50, "Player Turn", { fontSize: "30px", fill: "#FFCC00"});
        
        //this.cursors = this.input.keyboard.createCursorKeys();
        this.selectKeys = this.input.keyboard.addKeys('C,ENTER');
        this.selectKeys.enabled = false;
        
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
        
        this.input.keyboard.on('keyup-A', function (event) {
            this.playerAttack();
        }, this);
        
         
    }
    
    unitInfoScreen() {
        this.activeUnit = this.playerUnits[this.currentUnitNum];
        
        let infoWindow = this.add.container(850, 200);
        let screen = this.add.image(0, 0, "info");
        this.unitName = this.add.text(-110, -75, "Unit: " + this.activeUnit.getName(), { fontSize: "20px", fill: "#FFCC00"});
        this.unitSpaces = this.add.text(-110, -25, "Moves Left: " + this.activeUnit.getSpacesLeft(), { fontSize: "20px", fill: "#FFCC00"});
        infoWindow.add([screen, this.unitName, this.unitSpaces]);
        
        this.updateActiveUnit(this.activeUnit);
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
        if(!this.playerTurn) {
            return;
        }
        
        switch(direction) {        
            case "RIGHT":
                if((this.activeUnit.x + 60) < (this.mapX + this.offset)) {
                    this.activeUnit.x += 60;
                    this.activeUnit.incSpaces();
                }
                break;
            case "LEFT":
                if((this.activeUnit.x - 60) > this.offset) {
                    this.activeUnit.x -= 60;
                    this.activeUnit.incSpaces();
                }
                break;
            case "UP":
                if((this.activeUnit.y - 60) > 0) {
                    this.activeUnit.y -= 60;
                    this.activeUnit.incSpaces();
                }
                break;
            case "DOWN":
                if((this.activeUnit.y + 60) < this.mapY) {
                    this.activeUnit.y += 60;
                    this.activeUnit.incSpaces();
                }
                break;
        }
        
        if(this.activeUnit.hasMoved()) {
            console.log("max spaces");
            this.currentUnitNum++;
        }
        
        if(this.currentUnitNum > 5) {
            this.playerTurn = false;
            this.currentUnitNum = 0;
            this.activeUnit = this.enemyUnits[this.currentUnitNum];
            this.updateActiveUnit(this.activeUnit);
            this.enemyTimer();
        }
        else {
            this.activeUnit = this.playerUnits[this.currentUnitNum];
            this.updateActiveUnit(this.activeUnit);
        }
    }
    
    updateActiveUnit(activeUnit) {
        this.unitName.setText("Unit: " + activeUnit.getName());
        this.unitSpaces.setText("Moves Left: " + activeUnit.getSpacesLeft());
        
        const pointerTileXY = this.baseLayer.worldToTileXY(activeUnit.x, activeUnit.y);
        const snappedWorldPoint = this.baseLayer.tileToWorldXY(pointerTileXY.x, pointerTileXY.y);
        this.marker.setPosition(snappedWorldPoint.x, snappedWorldPoint.y);
    }
    
    enemyTimer() {
        this.turnText.setText("Computer Turn");
        
        this.timer = this.time.addEvent({
            delay: 500,                // ms
            callback: this.enemyAI,
            callbackScope: this,
            loop: true
        });
    }
    
    enemyAI() {
        this.enemyMoveUnit("DOWN");
        
        if(this.currentUnitNum > 5) {
            this.playerTurn = true;
            this.turnText.setText("Player Turn");
            this.currentUnitNum = 0;
            this.activeUnit = this.playerUnits[this.currentUnitNum];
            this.updateActiveUnit(this.activeUnit);
            this.timer.remove();
        }
    }
    
    enemyMoveUnit(direction) {
        
        switch(direction) {        
            case "RIGHT":
                if((this.activeUnit.x + 60) < (this.mapX + this.offset)) {
                    this.activeUnit.x += 60;
                    this.activeUnit.incSpaces();
                }
                break;
            case "LEFT":
                if((this.activeUnit.x - 60) > this.offset) {
                    this.activeUnit.x -= 60;
                    this.activeUnit.incSpaces();
                }
                break;
            case "UP":
                if((this.activeUnit.y - 60) > 0) {
                    this.activeUnit.y -= 60;
                    this.activeUnit.incSpaces();
                }
                break;
            case "DOWN":
                if((this.activeUnit.y + 60) < this.mapY) {
                    this.activeUnit.y += 60;
                    this.activeUnit.incSpaces();
                }
                break;
        }
        
        if(this.activeUnit.hasMoved()) {
            console.log("max spaces");
            this.currentUnitNum++;
        }
        
        if(this.currentUnitNum <= 5) {
            this.activeUnit = this.enemyUnits[this.currentUnitNum];
            this.updateActiveUnit(this.activeUnit);
        }
    }
    
    playerAttack() {
        let unitsInRange = this.activeUnit.getUnitsInRange(this.enemyUnits);
        let i;
        let temp;
        
        if(unitsInRange.length <= 0) {
            return;
        }
        
        this.playerTurn = false;
        this.hitMarker.setVisible(true);
        this.selectKeys.enabled = true;
        
        let infoWindow = this.add.container(850, 400);
        let attackText = this.add.text(-110, -75, "Units in Range", { fontSize: "20px", fill: "#FFCC00"});
        
        infoWindow.add(attackText);
        
        for(i = 0; i < unitsInRange.length; i++) {
            temp = this.add.text(-110, -50 + (20 * i), "" + (i+1) + ") " + unitsInRange[i].getName(), { fontSize: "20px", fill: "#FFCC00"});
            infoWindow.add(temp);
        }
        temp = this.add.text(-110, -50 + (40 * i), "Press 'C' to cycle units. Press ENTER to attack.", { fontSize: "20px", fill: "#FFCC00", wordWrap: { width: 200 }});
        infoWindow.add(temp);
        i = 0;
        
        
        
        let pointerTileXY = this.baseLayer.worldToTileXY(unitsInRange[i].x, unitsInRange[i].y);
        let snappedWorldPoint = this.baseLayer.tileToWorldXY(pointerTileXY.x, pointerTileXY.y);
        this.hitMarker.setPosition(snappedWorldPoint.x, snappedWorldPoint.y);
        
        this.selectKeys.C.on('down', function (event) {
             i++;
             if(i >= unitsInRange.length) {
                 i = 0;
             }
             
             pointerTileXY = this.baseLayer.worldToTileXY(unitsInRange[i].x, unitsInRange[i].y);
             snappedWorldPoint = this.baseLayer.tileToWorldXY(pointerTileXY.x, pointerTileXY.y);
             this.hitMarker.setPosition(snappedWorldPoint.x, snappedWorldPoint.y);
        }, this);
        
        
        this.selectKeys.ENTER.on('down', function (event) {
             this.selectKeys.enabled = false;
             this.playerTurn = true;
             this.hitMarker.setVisible(false);
             infoWindow.destroy();
             console.log("Attack!");
        }, this);
        
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
    
    getUnitsInRange(unitArray) {
        let unitsInRange = [];
        let dist;
        let i;
        
        for(i = 0; i < 6; i++) {
            dist = Phaser.Math.Distance.Between(this.x, this.y, unitArray[i].x, unitArray[i].y);
            if(dist < 85) {
                unitsInRange.push(unitArray[i]);
                console.log(unitArray[i].getName());
            }
        }
        
        return unitsInRange;
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
    
    getUnitsInRange(unitArray) {
        let unitsInRange = [];
        let dist;
        let i;
        
        for(i = 0; i < 6; i++) {
            dist = Phaser.Math.Distance.Between(this.x, this.y, unitArray[i].x, unitArray[i].y);
            if(dist < 85) {
                unitsInRange.push(unitArray[i]);
                console.log(unitArray[i].getName());
            }
        }
        
        return unitsInRange;
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
    
    getUnitsInRange(unitArray) {
        let unitsInRange = [];
        let dist;
        let i;
        
        for(i = 0; i < 6; i++) {
            dist = Phaser.Math.Distance.Between(this.x, this.y, unitArray[i].x, unitArray[i].y);
            if(dist < 85) {
                unitsInRange.push(unitArray[i]);
                console.log(unitArray[i].getName());
            }
        }
        
        return unitsInRange;
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
