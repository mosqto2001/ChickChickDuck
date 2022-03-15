//let name = prompt("Your Name").value;
let speed = 4;
let color;

var config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor:'#262323',
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

  this.add.image(0, 0, 'map');
  let p1 = this.add.image(1800, 0, 'p1');
  let p2 = this.add.image(2600, 0, 'p2');
  let p3 = this.add.image(3400, 0, 'p3');
  let p4 = this.add.image(4200, 0, 'p4');
   let p5 = this.add.image(5000, 0, 'p5');
   let p6 = this.add.image(5800, 0, 'p6');
    let p7 = this.add.image(6600, 0, 'p7');
     let p8 = this.add.image(7400, 0, 'p8');
     let p9 = this.add.image(8200, 0, 'p9');
  p1.scale = 0.4;
  p2.scale = 0.4;
  p3.scale = 0.4;
  p4.scale = 0.4;
  p5.scale = 0.4;
  p6.scale = 0.4;
  p7.scale = 0.4;
  p8.scale = 0.4;
  p9.scale = 0.4;
  cursors = this.input.keyboard.createCursorKeys();

  var self = this;

//   let map = this.add.tilemap("map");
//   let tileset1 = map.addTilesetImage("map", "tiles1");
//   let tileset2 = map.addTilesetImage("plant", "tiles2");

//   let botLayer = map.createStaticLayer("ground", tileset1, 0, 0);
//   let topLayer = map.createStaticLayer("object", tileset1, 0, 0);
//   let grassLayer = map.createStaticLayer("grass", tileset2, 0, 0);

// botLayer.scale = 3;
// topLayer.scale = 3;
// grassLayer.scale = 3;

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

  // this.cursors = this.input.keyboard.createCursorKeys();

  // this.physics.add.collider(this.player, this.map_border);
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
let ran = Math.floor(Math.random() * (10 - 1 + 1) + 1)
// if(ran % 1 === 0) c = "red"
// if(ran % 2 === 0) c = "blue"
// if(ran % 3 === 0) c = "green"
// if(ran % 5 === 0) c = "pink"
// if(ran % 6 === 0) c = "yellow"
if(ran > 2 ){ c = "red"}
else{c = "yellow"}
 
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
    .text(playerInfo.width, -86, "สะพริ้ววี่วี่", {
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

    // console.log(player2.texture.key.replace('cha_',''))
    // player2.play(`${player2.texture.key.replace('cha_','')}_died`);
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
    .text(playerInfo.x, playerInfo.y - 86, "มอสวีวี่", {
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
