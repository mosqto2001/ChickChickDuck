//let name = prompt("Your Name").value;
let speed = 4;

var config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: window.innerWidth,
  height: window.innerHeight,
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
      gravity: { y: 0 },
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
  this.anims.create({
    key: "died",
    frames: this.anims.generateFrameNumbers("character", {
      start: 42,
      end: 52,
    }),
    frameRate: 16,
    repeat: 0,
  });

  cursors = this.input.keyboard.createCursorKeys();

  var self = this;

  let map = this.add.tilemap("map");
  let tileset = map.addTilesetImage("map", "tiles");

  let botLayer = map.createStaticLayer("ground", tileset, 0, 0);
  let topLayer = map.createStaticLayer("object", tileset, 0, 0);

  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  this.socket.on("currentPlayers", function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
  });

  this.socket.on("newPlayer", function (playerInfo, players) {
    addOtherPlayers(self, playerInfo);
  });

  this.socket.on("playerDisconnect", function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.nameLabel.destroy();
        otherPlayer.destroy();
      }
    });
  });

  this.socket.on("playerMoved", function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.nameLabel.setPosition(playerInfo.x, playerInfo.y - 86);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        otherPlayer.play(playerInfo.animation, true);
        otherPlayer.flipX = playerInfo.flipX;
      }
    });
  });
  this.cursors = this.input.keyboard.createCursorKeys();
}
function update() {
  if (this.player && this.playerInfo.status === 0) {
    // emit player movement
    var x = this.playerContainer.x;
    var y = this.playerContainer.y;
    var a = this.player.animation;
    var f = this.player.flipX;
    // this.player.setVelocityY(-160);
    this.player.flipX = false;
    if (cursors.left.isDown) {
      this.playerContainer.x -= speed;

      this.player.anims.play("side", true);
      this.player.flipX = true;
      this.player.animation = "side";
      if (cursors.up.isDown) {
        this.playerContainer.y -= speed;
      } else if (cursors.down.isDown) {
        this.playerContainer.y += speed;
      }
    } else if (cursors.right.isDown) {
      this.playerContainer.x += speed;
      this.player.anims.play("side", true);
      this.player.animation = "side";
      if (cursors.up.isDown) {
        this.playerContainer.y -= speed;
      } else if (cursors.down.isDown) {
        this.playerContainer.y += speed;
      }
    } else if (cursors.down.isDown) {
      this.playerContainer.y += speed;
      this.player.anims.play("front", true);
      this.player.animation = "front";
      if (!cursors.left.isDown && !cursors.right.isDown) {
      }
    } else if (cursors.up.isDown) {
      this.playerContainer.y -= speed;
      this.player.anims.play("back", true);
      this.player.animation = "back";
      if (!cursors.left.isDown && !cursors.right.isDown) {
      }
    } else {
      this.player.anims.play("idle", true);
      this.player.animation = "idle";
    }
    if (
      this.player.old &&
      (x !== this.playerContainer.x ||
        y !== this.playerContainer.y ||
        a !== this.playerContainer.a)
    ) {
      this.socket.emit("playerMovement", {
        x: this.playerContainer.x,
        y: this.playerContainer.y,
        animation: this.player.animation,
        flipX: this.player.flipX,
      });
    }


    this.player.old = {
      x: this.playerContainer.x,
      y: this.playerContainer.y,
      a: this.player.animation,
      f: this.player.flipX,
    };
  }
}

function addPlayer(self, playerInfo) {
  let player = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, "character")
    .setOrigin(1.5, 1.5)
    .setDisplaySize(150, 150)

  let playerContainer = self.add
    .container(playerInfo.x, playerInfo.y)
    .setSize(playerInfo.width, playerInfo.height)
    .setDepth(3);

  //อัครภิทักษ์ศรฆินรวัฒน์
  var playerName = self.add
    .text(playerInfo.width, -86, "พริ้วรักมอส", {
      fontFamily: "Mitr",
      color: "#fff",
      stroke: "#000000",
      strokeThickness: 2,
    })
    .setFontSize(18)
    .setOrigin(0.5, 0.5);

  playerContainer.add(player);
  playerContainer.add(playerName);

  self.player = player;
  self.playerContainer = playerContainer;
  self.cameras.main.startFollow(self.playerContainer);

  self.playerInfo = new Character(
    self.socket.id,
    "sad",
    "yellow",
    0,
    null,
    null
  );

  let playerOverlapEvent = self.physics.add.overlap(self.player, self.otherPlayers, playerOverlap);
  let playerOverlapPlayer = self.physics.add.overlap(self.otherPlayers, self.otherPlayers, playerOverlapAnother);

  function playerOverlap(player1, player2) {
    playerContainer.depth = playerContainer.y;
    player2.depth = player2.y;

    // player.setVelocity(0);
    // player.play("died");
    // a.active = false;
  }

  function playerOverlapAnother(player1, player2) {
    player1.depth = player1.y;
    player2.depth = player2.y;
  }
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add
    .sprite(playerInfo.x, playerInfo.y, "character")
    .setOrigin(0.5, 0.5)
    .setDisplaySize(150, 150)
    .setDepth(2);
  otherPlayer.playerId = playerInfo.playerId;
  // otherPlayer.setDepth(2);

  var playerName = self.add
    .text(playerInfo.x, playerInfo.y - 86, "มอสรักพริ้ว", {
      fontFamily: "Mitr",
      color: "#fff",
      stroke: "#000000",
      strokeThickness: 2,
    })
    .setFontSize(18)
    .setOrigin(0.5, 0.5);

  otherPlayer.nameLabel = playerName;

  self.otherPlayers.add(otherPlayer);
}
