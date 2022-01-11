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
  this.load.spritesheet("ship", "assets/character/character.png", {
    frameWidth: 150,
    frameHeight: 150,
  });
  this.load.image("otherPlayer", "assets/enemyBlack5.png");
  this.load.image("star", "assets/star_gold.png");
}
function create() {
  this.anims.create({
    key: "idle",
    frames: this.anims.generateFrameNumbers("ship", { frames: [0, 1,2,3,4,5] }),
    frameRate: 8,
    repeat: -1,
  });

  

  var self = this;
  self.score = 0;


  const scorebroadHeader = this.add.text(window.innerWidth - 300, 24, "", {
    fontSize: "24px",
    fill: "#ffffff",
  });
  scorebroadHeader.setText("Scorebroad");

  self.scorebroad = self.add.text(window.innerWidth - 300, 60, "", {
    fontSize: "20px",
    fill: "#ffffff",
  });
  this.socket = io();
  this.otherPlayers = this.physics.add.group();
  this.socket.on("currentPlayers", function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        addPlayer(self, players[id]);
        self.ship.play("idle");
      } else {
        addOtherPlayers(self, players[id]);
      }
    });
    showScorebroad(self,players);
  });
  this.socket.on("newPlayer", function (playerInfo,players) {
    addOtherPlayers(self, playerInfo);
    showScorebroad(self,players)
  });
  this.socket.on("playerDisconnect", function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy();
        showScorebroad(self,players)
      }
    });
  });
  
  this.socket.on("playerMoved", function (playerInfo) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerInfo.playerId === otherPlayer.playerId) {
        otherPlayer.setRotation(playerInfo.rotation);
        otherPlayer.setPosition(playerInfo.x, playerInfo.y);
      }
    });
  });
  this.cursors = this.input.keyboard.createCursorKeys();

  this.socket.on("scoreUpdate", function (players) {
      self.score = self.score + 1;
    showScorebroad(self,players)
    console.log("d")
  });

  this.socket.on("resetScorebroad", function (players) {
      showScorebroad(self, players);
});

  this.socket.on("starLocation", async function (starLocation) {
    if (self.star) self.star.destroy();
    self.star = self.physics.add.image(starLocation.x, starLocation.y, "star").setDisplaySize(50, 50);
    self.physics.add.overlap(
      self.ship,
      self.star,
      function () {
        if(!self.ship.collected){
        self.ship.collected = true;
        this.socket.emit("starCollected");
        console.log("e")
        }
      },
      null,
      self
    );
    setTimeout(()=>{
      self.ship.collected = false;
    },2000)

  });

}
function update() {

  if (this.ship) {
    // emit player movement
    var x = this.ship.x;
    var y = this.ship.y;
    var r = this.ship.rotation;
    if (
      this.ship.oldPosition &&
      (x !== this.ship.oldPosition.x ||
        y !== this.ship.oldPosition.y ||
        r !== this.ship.oldPosition.rotation)
    ) {
      this.socket.emit("playerMovement", {
        x: this.ship.x,
        y: this.ship.y,
        rotation: this.ship.rotation,
      });
    }
    // save old position data
    this.ship.oldPosition = {
      x: this.ship.x,
      y: this.ship.y,
      rotation: this.ship.rotation,
    };

    if (this.cursors.left.isDown) {
      this.ship.setAngularVelocity(-150);
    } else if (this.cursors.right.isDown) {
      this.ship.setAngularVelocity(150);
    } else {
      this.ship.setAngularVelocity(0);
    }

    if (this.cursors.up.isDown) {
      this.physics.velocityFromRotation(
        this.ship.rotation - 1.5,
        100,
        this.ship.body.acceleration
      );
    } else {
      this.ship.setAcceleration(0);
    }
  }

}


function addPlayer(self, playerInfo) {
  self.ship = self.physics.add
        .sprite(playerInfo.x, playerInfo.y, "ship")
        .setOrigin(0.5, 0.5)
        .setDisplaySize(200, 200);
  self.ship.setDrag(100);
  self.ship.setAngularDrag(100);
  self.ship.setMaxVelocity(200);
  self.ship.setDepth(3);
  self.ship.collected = false;
}

function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, "ship")
    .setOrigin(0.5, 0.5)
    .setDisplaySize(100, 100);
    otherPlayer.play("idle");
    otherPlayer.alpha = 0.5;
  otherPlayer.playerId = playerInfo.playerId;
  otherPlayer.rotation = playerInfo.rotation;
  otherPlayer.setDepth(2);
  self.otherPlayers.add(otherPlayer);
}

function showScorebroad(self,players){
  let scoreList = [];
  for(let player in players){
    scoreList.push(`${players[player].playerName} : ${players[player].score}`);
  }
  self.scorebroad.setText(scoreList);
}



// function update() {

//   if (this.player && this.status === 1) {
   
//     // emit player movement
//     var x = this.player.x;
//     var y = this.player.y;
//     var a = this.player.animation;
//     var f = this.player.flipX;
//     // this.player.setVelocityY(-160);
//     this.player.flipX = false;
//     if (cursors.left.isDown) {
//       this.playerContainer.x -= speed;
//       this.player.anims.play("side", true);
//       this.player.flipX = true;
//       this.player.animation = "side";
//       if (cursors.up.isDown) {
//         this.playerContainer.y -= speed;
//       } else if (cursors.down.isDown) {
//         this.playerContainer.y += speed;
//       }
//     } else if (cursors.right.isDown) {
//       this.playerContainer.x += speed;
//       this.player.anims.play("side", true);
//       this.player.animation = "side";
//       if (cursors.up.isDown) {
//         this.playerContainer.y -= speed;
//       } else if (cursors.down.isDown) {
//         this.playerContainer.y += speed;
//       }
//     } else if (cursors.down.isDown) {
//       this.playerContainer.y += speed;
//       this.player.anims.play("front", true);
//       this.player.animation = "front";
//       if (!cursors.left.isDown && !cursors.right.isDown) {
//       }
//     } else if (cursors.up.isDown) {
//       this.playerContainer.y -= speed;
//       this.player.anims.play("back", true);
//       this.player.animation = "back";
//       if (!cursors.left.isDown && !cursors.right.isDown) {
//       }
//     } 
//     else {
//       this.player.anims.play("idle", true);
//       this.player.animation = "idle";
//     }
//     if (
//       this.player.old &&
//       (x !== this.player.old.x ||
//         y !== this.player.old.y || a !== this.player.old.a)
//     ) {
//       this.socket.emit("playerMovement", {
//         x: this.player.x,
//         y: this.player.y,
//         animation: this.player.animation,
//         flipX: this.player.flipX,
//       });

   
//     }

//     this.player.old = {
//       x: this.player.x,
//       y: this.player.y,
//       a: this.player.animation,
//       f: this.player.flipX
//     };

// }
// }