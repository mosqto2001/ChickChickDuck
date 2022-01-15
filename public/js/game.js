//let name = prompt("Your Name").value;
let speed = 4;
let color;

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
  loadSprite(this);
}
function create() {
  createAnimation(this);

  
  cursors = this.input.keyboard.createCursorKeys();

  var self = this;

  let player = self.physics.add
    .sprite(50, 50, "cha_red")
    .setOrigin(1.5, 1.5)
    .setDisplaySize(150, 150)


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
        console.log(players[id])
        addOtherPlayers(self, players[id]);

      }
    });
  });

  this.socket.on("newPlayer", function (playerInfo, players) {
    console.log(playerInfo)
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

  this.socket.on("playerInfo", function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (otherPlayer.playerId === playerInfo.id) {
        otherPlayer.playerInfo = playerInfo;
        console.log(otherPlayer.playerInfo.color)
        otherPlayer.play(`${otherPlayer.playerInfo.color}_idle`)

      }
    });
  });

  this.cursors = this.input.keyboard.createCursorKeys();
}
function update() {
  if (this.player && this.playerInfo.status === 0) {
    // emit player movement
    let x = this.playerContainer.x;
    let y = this.playerContainer.y;
    let a = this.player.animation;
    let f = this.player.flipX;
    // this.player.setVelocityY(-160);
    this.player.flipX = false;
    if (cursors.left.isDown) {
      this.playerContainer.x -= speed;

      this.player.anims.play(`${color}_side`, true);
      this.player.flipX = true;
      this.player.animation = `${color}_side`;
      if (cursors.up.isDown) {
        this.playerContainer.y -= speed;
      } else if (cursors.down.isDown) {
        this.playerContainer.y += speed;
      }
    } else if (cursors.right.isDown) {
      this.playerContainer.x += speed;
      this.player.anims.play(`${color}_side`, true);
      this.player.animation = `${color}_side`;
      if (cursors.up.isDown) {
        this.playerContainer.y -= speed;
      } else if (cursors.down.isDown) {
        this.playerContainer.y += speed;
      }
    } else if (cursors.down.isDown) {
      this.playerContainer.y += speed;
      this.player.anims.play(`${color}_front`, true);
      this.player.animation = `${color}_front`;
      if (!cursors.left.isDown && !cursors.right.isDown) {
      }
    } else if (cursors.up.isDown) {
      this.playerContainer.y -= speed;
      this.player.anims.play(`${color}_back`, true);
      this.player.animation = `${color}_back`;
      if (!cursors.left.isDown && !cursors.right.isDown) {
      }
    } else {
      this.player.anims.play(`${color}_idle`, true);
      this.player.animation = `${color}_idle`;
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
  let c = "yellow"
let ran = Math.floor(Math.random() * (5 - 1 + 1) + 1)
if(ran % 1 === 0) c = "red"
if(ran % 2 === 0) c = "blue"
if(ran %3 === 0) c = "green"
if(ran %5 === 0) c = "pink"

  self.playerInfo = new Character(
    self.socket.id,
    "sad",
    c,
    0,
    null,
    null
  );
  
  color = self.playerInfo.color
   // `cha_${self.playerInfo.color}`

   self.socket.emit("playerInfoUpdate", self.playerInfo);

  let player = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, `cha_${self.playerInfo.color}`)//${self.playerInfo.color}
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
// `cha_${playerInfo.playerInfo.color}`
function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add
    .sprite(playerInfo.x, playerInfo.y,`cha_red`)//${playerInfo.playerInfo.color}
    .setOrigin(0.5, 0.5)
    .setDisplaySize(150, 150)
    .setDepth(2);
  otherPlayer.playerId = playerInfo.playerId;
  // otherPlayer.setDepth(2);
// console.log(playerInfo.playerInfo)
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
