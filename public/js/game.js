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
  this.load.image("otherPlayer", "assets/enemyBlack5.png");
  this.load.image("star", "assets/star_gold.png");
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

  cursors = this.input.keyboard.createCursorKeys();

  var self = this;

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
  this.socket.on("newPlayer", function (playerInfo,players) {
    addOtherPlayers(self, playerInfo);

  });
  this.socket.on("playerDisconnect", function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();

      }
    });
  });
  
  this.socket.on("playerMoved", function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        console.log("dsads")
        otherPlayer.play(playerInfo.animation,true);
        otherPlayer.flipX = playerInfo.flipX
      }
    });
  });
  this.cursors = this.input.keyboard.createCursorKeys();

}
function update() {

  if (this.player) {
    // emit player movement
    var x = this.player.x;
    var y = this.player.y;
    var a = this.player.animation;
    var f = this.player.flipX;

    this.player.flipX = false;
    this.player.setVelocity(0);
    if (cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("side", true);
      this.player.flipX = true;
      this.player.animation = "side";
      if (cursors.up.isDown) {
        this.player.setVelocityY(-160);
      } else if (cursors.down.isDown) {
        this.player.setVelocityY(160);
      }
    } else if (cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("side", true);
      this.player.animation = "side";
      if (cursors.up.isDown) {
        this.player.setVelocityY(-160);
      } else if (cursors.down.isDown) {
        this.player.setVelocityY(160);
      }
    } else if (cursors.down.isDown) {
      this.player.setVelocityY(160);
      this.player.anims.play("front", true);
      this.player.animation = "front";
      if (!cursors.left.isDown && !cursors.right.isDown) {
        this.player.setVelocityX(0);
      }
    } else if (cursors.up.isDown) {
      this.player.setVelocityY(-160);
      this.player.anims.play("back", true);
      this.player.animation = "back";
      if (!cursors.left.isDown && !cursors.right.isDown) {
        this.player.setVelocityX(0);
      }
    } else {
      this.player.setVelocity(0);
      this.player.anims.play("idle", true);
      this.player.animation = "idle";
    }
    if (
      this.player.old &&
      (x !== this.player.old.x ||
        y !== this.player.old.y || a !== this.player.old.a)
    ) {
      this.socket.emit("playerMovement", {
        x: this.player.x,
        y: this.player.y,
        animation: this.player.animation,
        flipX: this.player.flipX,
      });

   
    }

    this.player.old = {
      x: this.player.x,
      y: this.player.y,
      a: this.player.animation,
      f: this.player.flipX
    };

    // if(a !== this.player.oldPosition.animation || f) {
    //   this.socket.emit("playerAnimation", {
    //   animation: this.player.animation,
    //   });
    // }
    // save old position data

}
}


function addPlayer(self, playerInfo) {
  self.player = self.physics.add
        .sprite(playerInfo.x, playerInfo.y, "character")
        .setOrigin(0.5, 0.5)
        .setDisplaySize(150, 150);
  self.player.setDepth(3);
  self.player.collected = false;
  self.cameras.main.startFollow(self.player);
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, "character")
    .setOrigin(0.5, 0.5)
    .setDisplaySize(150, 150);
    otherPlayer.alpha = 0.5;
  otherPlayer.playerId = playerInfo.playerId;
  otherPlayer.setDepth(2);
  self.otherPlayers.add(otherPlayer);
}

