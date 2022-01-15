const colors = ["yellow","red","pink","green","blue"]

function loadSprite(self){
  self.load.image("tiles", "assets/img/map/map.png");
  self.load.tilemapTiledJSON("map", "assets/map_json/map.json");

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