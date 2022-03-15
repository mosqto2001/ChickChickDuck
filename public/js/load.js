const colors = ["yellow","red","pink","green","blue"]

function loadSprite(self){
  self.load.image("map", "assets/img/map/map.png");
  self.load.image("map_border", "assets/img/map/map_border.png")
  self.load.image("tiles2", "assets/img/map/plant.png");
  self.load.tilemapTiledJSON("map", "assets/map_json/map.json");

  self.load.image("p1", "assets/img/prew/1.png");
  self.load.image("p2", "assets/img/prew/2.png");
  self.load.image("p3", "assets/img/prew/3.png");
  self.load.image("p4", "assets/img/prew/4.png");
  self.load.image("p5", "assets/img/prew/5.png");
  self.load.image("p6", "assets/img/prew/6.png");
  self.load.image("p7", "assets/img/prew/7.png");
  self.load.image("p8", "assets/img/prew/8.png");
  self.load.image("p9", "assets/img/prew/9.png");

  colors.forEach((color) => {
    self.load.spritesheet(`cha_${color}`, `assets/img/character/cha_${color}.png`, {
      frameWidth: 150,
      frameHeight: 150,
    });
  })

}

function createAnimation(self){
  colors.forEach((color) => {
  self.anims.create({
    key: `${color}_idle`,
    frames: self.anims.generateFrameNumbers(`cha_${color}`, { start: 0, end: 0 }),
    frameRate: 10,
    repeat: -1,
  });
  self.anims.create({
    key: `${color}_front`,
    frames: self.anims.generateFrameNumbers(`cha_${color}`, { start: 0, end: 11 }),
    frameRate: 25,
    repeat: -1,
  });
  self.anims.create({
    key: `${color}_back`,
    frames: self.anims.generateFrameNumbers(`cha_${color}`, {
      start: 14,
      end: 25,
    }),
    frameRate: 25,
    repeat: -1,
  });
  self.anims.create({
    key: `${color}_side`,
    frames: self.anims.generateFrameNumbers(`cha_${color}`, {
      start: 28,
      end: 39,
    }),
    frameRate: 25,
    repeat: -1,
  });
  self.anims.create({
    key: `${color}_died`,
    frames: self.anims.generateFrameNumbers(`cha_${color}`, {
      start: 42,
      end: 52,
    }),
    frameRate: 16,
    repeat: 0,
  });
});
}  