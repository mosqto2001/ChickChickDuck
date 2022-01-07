var config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config);

function preload() {
  this.load.spritesheet("character", "assets/img/character/character.png", {
    frameWidth: 150,
    frameHeight: 150,
  });

  this.load.image("tiles", "assets/img/map/map.png");
  this.load.tilemapTiledJSON("map", "assets/map_json/map.json");
}

function create() {
  var self = this;

  let map = this.add.tilemap("map");
  let tileset = map.addTilesetImage("map", "tiles");

  let botLayer = map.createStaticLayer("ground", tileset, 0, 0);
  let topLayer = map.createStaticLayer("object", tileset, 0, 0);

  // this.player = this.physics.add.sprite(150, 150, "character");

  // botLayer.scaleX = 3

  this.anims.create({
    key: "idle",
    frames: this.anims.generateFrameNumbers("character", { start: 0, end: 0 }),
    frameRate: 10,
    repeat: -1,
  });
  this.anims.create({
    key: "front",
    frames: this.anims.generateFrameNumbers("character", { start: 0, end: 11 }),
    frameRate: 25,
    repeat: -1,
  });
  this.anims.create({
    key: "back",
    frames: this.anims.generateFrameNumbers("character", {
      start: 14,
      end: 25,
    }),
    frameRate: 25,
    repeat: -1,
  });
  this.anims.create({
    key: "side",
    frames: this.anims.generateFrameNumbers("character", {
      start: 28,
      end: 39,
    }),
    frameRate: 25,
    repeat: -1,
  });
  cursors = this.input.keyboard.createCursorKeys();


  let position = {x:150,y:0}
this.socket = io();
this.otherPlayers = this.physics.add.group();
this.socket.on("currentPlayers", function (players) {
  Object.keys(players).forEach(function (id) {
    if (players[id].playerId === self.socket.id) {
      //  createPlayer(self,players[id]);
      position.x = players[id].x;
      position.y = players[id].y;
      
    } else {
      addOtherPlayers(self,players[id]);
    }
  });
});

this.player = this.physics.add.sprite(position.x, position.y, "character")
this.cameras.main.startFollow(this.player);

this.socket.on("newPlayer", function (playerInfo) {
  addOtherPlayers(playerInfo);
});

// this.socket.on('playerDisconnect', function (playerId) {
//   this.otherPlayers.getChildren().forEach(function (player) {
//     if (playerId === player.playerId) {
//       player.destroy();
//     }
//   });
// });


  

  
}

function update() {
  playerControl(this.player);
}

function playerControl(player) {
  // if (
  //   this.player.oldPosition &&
  //   (x !== this.player.oldPosition.x ||
  //     y !== this.player.oldPosition.y) ) 
  // {
  //   this.socket.emit("playerMovement", {
  //     x: this.player.x,
  //     y: this.player.y,

  //   });
  // }

  // this.player.oldPosition = {
  //   x: this.player.x,
  //   y: this.player.y,
  // };
  player.flipX = false;
  player.setVelocity(0);
  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play("side", true);
    player.flipX = true;
    if (cursors.up.isDown) {
      player.setVelocityY(-160);
    } else if (cursors.down.isDown) {
      player.setVelocityY(160);
    }
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play("side", true);
    if (cursors.up.isDown) {
      player.setVelocityY(-160);
    } else if (cursors.down.isDown) {
      player.setVelocityY(160);
    }
  } else if (cursors.down.isDown) {
    player.setVelocityY(160);
    player.anims.play("front", true);
    if (!cursors.left.isDown && !cursors.right.isDown) {
      player.setVelocityX(0);
    }
  } else if (cursors.up.isDown) {
    player.setVelocityY(-160);
    player.anims.play("back", true);
    if (!cursors.left.isDown && !cursors.right.isDown) {
      player.setVelocityX(0);
    }
  } else {
    player.setVelocity(0);
    player.anims.play("idle");
  }
}



function createPlayer(self,playerInfo) {
  self.player  = self.physics.add.sprite(playerInfo.x, playerInfo.y, "character");
  
  // self.cameras.main.startFollow(self.player);
}

function addOtherPlayers(self,playerInfo){
  const otherPlayer = self.physics.add.sprite(playerInfo.x, playerInfo.y, 'character');
  otherPlayer.playerId = playerInfo.playerId;
  self.otherPlayers.add(otherPlayer);
}

