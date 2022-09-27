//let name = prompt("Your Name").value;
let speed = 4;

var config = {
  type: Phaser.AUTO,
  parent: "phaser-example",
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: "#262323",
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

  this.add.image(0, 0, "map").setDepth(-1000);

  // this.map.map_border.create(0,0,"map_border").setScale(1).refreshBody();
  //this.physics.add.staticSprite(0, 0, "map_border").setDepth(-900).refreshBody()
  cursors = this.input.keyboard.createCursorKeys();

  var self = this;

  this.sounds = {
    background_music: this.sound.add("background_music", {
      loop: true,
      volume: 0.5,
    }),
    join: this.sound.add("join"),
    quit: this.sound.add("quit"),
    kill: this.sound.add("kill"),
  };

  self.sounds.background_music.play();

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
    self.sounds.join.play();

    //this.sounds.join.play();
  });

  this.socket.on("playerDisconnect", function (playerId) {
    self.otherPlayers.getChildren().forEach(function (otherPlayer) {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.nameLabel.destroy();
        otherPlayer.destroy();
        self.sounds.quit.play();
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
    otherPlayer = self.otherPlayers
      .getChildren()
      .find((player) => player.playerId === playerInfo.id);
    otherPlayer.playerInfo = playerInfo;
    otherPlayer.play(`${otherPlayer.playerInfo.color}_idle`);
  });

  this.socket.on("playerDied", function (playerId) {
    if (self.playerInfo.id === playerId) {
      self.player.play(`${self.playerInfo.color}_died`);
      self.playerInfo.status = 1;
    } else {
      let target = self.otherPlayers
        .getChildren()
        .find((player) => player.playerId === playerId);
      target.playerInfo.status = 1;
      target.play(`${target.playerInfo.color}_died`);
    }
  });

  //skill button
  this.userInterface = {
    button: this.add
      .sprite(
        window.innerWidth - 195,
        window.innerHeight - 150,
        "killer_skill_1"
      )
      .setInteractive()
      .on("pointerdown", () => {
        if (!self.userInterface.isCooldown && self.playerInfo.target) {
          skill_kill(this);

          function skill_kill(self) {
            self.socket.emit("killPlayer", self.playerInfo.target);
            self.userInterface.setCooldown(5);
            self.sounds.kill.play();
            self.playerInfo.target = null;
          }
          
          self.userInterface.button.on("changedata-cooldown", function () {
            self.userInterface.cooldownLabel.setText(
              self.userInterface.button.data.get("cooldown")
            );
          });
        }
      })
      .setScrollFactor(0)
      .setDisplaySize(150, 140)
      .setAlpha(0.3),

    cooldownLabel: this.add
      .text(window.innerWidth - 200, window.innerHeight - 150, null, {
        fontFamily: "Mitr",
        color: "#fff",
        stroke: "#000000",
        strokeThickness: 1,
      })
      .setFontSize(32)
      .setOrigin(0.5, 0.5)
      .setScrollFactor(0),
    setCooldown: function (cooldown) {
      self.userInterface.isCooldown = true;
      let left = cooldown;
      let cooldownCount = setInterval(function () {
        self.userInterface.button.data.set("cooldown", left);

        if (left-- === 0) {
          self.userInterface.isCooldown = false;
          self.userInterface.button.data.set("cooldown", null);
          self.userInterface.disableSkill();
          clearInterval(cooldownCount);
        }
      }, 1000);
    },
    enableSkill: function () {
      self.userInterface.button.setAlpha(1);
    },
    disableSkill: function () {
      self.userInterface.button.setAlpha(0.3);
    },
    isCooldown: false,
  };

  this.userInterface.button.setDataEnabled();

  // this.userInterface.button = this.add
  //   .sprite(window.innerWidth - 200, window.innerHeight - 150, "killer_skill_1")
  //   .setInteractive()
  //   .on("pointerdown", () => {
  //     this.add
  //       .text(
  //         this.playerContainer.x,
  //         this.playerContainer.y - 120,
  //         "ผมรักลุงตู่",
  //         {
  //           fontFamily: "Mitr",
  //           color: "#ffff66",
  //         }
  //       )
  //       .setFontSize(18)
  //       .setOrigin(0.5, 0.5);
  //   })
  //   .setScrollFactor(0)
  //   .setDisplaySize(150, 140);
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

      this.player.anims.play(`${this.playerInfo.color}_side`, true);
      this.player.flipX = true;
      this.player.animation = `${this.playerInfo.color}_side`;
      if (cursors.up.isDown) {
        this.playerContainer.y -= speed;
      } else if (cursors.down.isDown) {
        this.playerContainer.y += speed;
      }
    } else if (cursors.right.isDown) {
      this.playerContainer.x += speed;
      this.player.anims.play(`${this.playerInfo.color}_side`, true);
      this.player.animation = `${this.playerInfo.color}_side`;
      if (cursors.up.isDown) {
        this.playerContainer.y -= speed;
      } else if (cursors.down.isDown) {
        this.playerContainer.y += speed;
      }
    } else if (cursors.down.isDown) {
      this.playerContainer.y += speed;
      this.player.anims.play(`${this.playerInfo.color}_front`, true);
      this.player.animation = `${this.playerInfo.color}_front`;

      // console.log(this.physics.closest(this.player,this.otherPlayers))
      // console.log(this.otherPlayers.getClosestTo(this.player))
      // console.log(this.player)
      // if (!cursors.left.isDown && !cursors.right.isDown) {
      // }
    } else if (cursors.up.isDown) {
      this.playerContainer.y -= speed;
      this.player.anims.play(`${this.playerInfo.color}_back`, true);
      this.player.animation = `${this.playerInfo.color}_back`;
      // if (!cursors.left.isDown && !cursors.right.isDown) {
      // }
    } else {
      this.player.anims.play(`${this.playerInfo.color}_idle`, true);
      this.player.animation = `${this.playerInfo.color}_idle`;
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

    // if(this.player.data.get('target') !== null){
    // this.player.data.set('target', null);
    // }

    if (
      this.player.body.embedded &&
      !this.userInterface.isCooldown &&
      this.playerInfo.target
    ) {
      this.userInterface.enableSkill();
    } else {
      this.userInterface.disableSkill();
      this.playerInfo.target = null;
    }
  }

  // if(self.iss === true){
  //   console.log(self.iss);
  // }else{
  // self.iss = false;
  // }

  // if(this.player.idd !== null)
  // console.log(this.player.idd);

  // this.playerInfo.target = false;
  // if(this.playerInfo){
  //   this.playerInfo.target = false

  // }
}

function addPlayer(self, playerInfo) {
  let c = "yellow";
  let ran = Math.floor(Math.random() * (10 - 1 + 1) + 1);
  if (ran % 1 === 0) c = "red";
  if (ran % 2 === 0) c = "blue";
  if (ran % 3 === 0) c = "green";
  if (ran % 5 === 0) c = "pink";
  if (ran % 6 === 0) c = "yellow";

  self.playerInfo = new Character(self.socket.id, "Player1", c, 0, null, null);

  // color = self.playerInfo.color;
  // `cha_${self.playerInfo.color}`

  let player = self.physics.add
    .sprite(playerInfo.x, playerInfo.y, `cha_${self.playerInfo.color}`) //${self.playerInfo.color}
    .setOrigin(1.5, 1.5)
    .setDisplaySize(150, 150);

  let playerContainer = self.add
    .container(playerInfo.x, playerInfo.y)
    .setSize(playerInfo.width, playerInfo.height)
    .setDepth(3);

  //อัครภิทักษ์ศรฆินรวัฒน์
  var playerName = self.add
    .text(playerInfo.width, -86, playerInfo.playerName, {
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

  // self.player.setDataEnabled();

  // self.player.on('changedata-target', function (obj, value) {
  //   if(value !== null){
  //     self.userInterface.button.setAlpha(1)
  //     console.log(1)
  //   }else{
  //     self.userInterface.button.setAlpha(1)
  //     console.log(2)
  //   }
  // });

  let playerOverlapEvent = self.physics.add.overlap(
    self.player,
    self.otherPlayers,
    playerOverlap
  );

  let playerOverlapPlayer = self.physics.add.overlap(
    self.otherPlayers,
    self.otherPlayers,
    playerOverlapAnother
  );

  function playerOverlap(player1, player2) {
    playerContainer.depth = playerContainer.y;
    player2.depth = player2.y;
    // self.player.data.set('target', player2.playerId);

    // self.userInterface.button.setAlpha(1)
    if (
      typeof player2.playerInfo !== "undefined" &&
      player2.playerInfo.status === 0
    ) {
      self.playerInfo.target = player2.playerId;
    }
    // console.log(player2.playerInfo.status)
    // console.log(player2.texture.key.replace('cha_',''))
    // player2.play(`${player2.texture.key.replace('cha_','')}_died`);
  }

  function playerOverlapAnother(player1, player2) {
    player1.depth = player1.y;
    player2.depth = player2.y;
  }

  self.socket.emit("playerInfoUpdate", self.playerInfo);
}
// `cha_${playerInfo.playerInfo.color}`
function addOtherPlayers(self, playerInfo) {
  const otherPlayer = self.add
    .sprite(
      playerInfo.x,
      playerInfo.y,
      playerInfo.playerInfo ? `cha_${playerInfo.playerInfo.color}` : `cha_red`
    ) //${playerInfo.playerInfo.color}
    .setOrigin(0.5, 0.5)
    .setDisplaySize(150, 150)
    .setDepth(2);
  otherPlayer.playerId = playerInfo.playerId;
  otherPlayer.playerInfo = playerInfo.playerInfo;
  // otherPlayer.setDepth(2);

  var playerName = self.add
    .text(playerInfo.x, playerInfo.y - 86, playerInfo.playerName, {
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
