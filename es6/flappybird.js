//1. Setup variables
//1.1 create aliases
let Application = PIXI.Application,
  Container = PIXI.Container,
  loader = PIXI.Loader.shared,
  Texture = PIXI.Texture,
  TilingSprite = PIXI.TilingSprite;
Sound = PIXI.sound;
// Sound = PIXI.sound;
//1.2 Create App, Game Scene, End Scene, renderer
let app = new Application({
    width: 910,
    height: 512,
    backgroundColor: 0x1099bb,
    resolution: window.devicePixelRatio || 1
  }),
  renderer = app.renderer,
  gameScene = new Container(800, 600),
  endScene = new Container();
document.body.appendChild(app.view);
let scale = scaleToWindow(renderer.view);

app.stage.addChild(gameScene);
app.stage.addChild(endScene);

//1.3 Variables
let u,
  d,
  t,
  b,
  clouds,
  state,
  blocks,
  finishSprite,
  pixie,
  numberOfPillars,
  gapSize,
  starsStream,
  pointer,
  dustFrames,
  music,
  hit,
  isDead = false,
  jumpSound;
//1.4 Load json
const manifest = {
  music: "../../sounds/music.wav",
  wings: "../../sounds/sfx_wing.wav",
  hit: "../../sounds/sfx_hit.wav"
};

for (let name in manifest) {
  PIXI.Loader.shared.add(name, manifest[name]);
}

loader.add("./images/pixiePerilousness.json").load(setup);

//////////////////////////////////////
//2. Setup
//////////////////////////////////////
function setup(loader, res) {
  music = res.music.sound;
  wings = res.wings.sound;
  hit = res.hit.sound;
  music.play({ loop: true });
  document.addEventListener("click", () => {
    wings.play();
  });
  //2.1
  t = new Tink(PIXI, app.view, scale);
  u = new SpriteUtilities(PIXI);
  d = new Dust(PIXI);
  b = new Bump(PIXI);

  //2.2 Create Sprites
  id = new PIXI.Texture.from("./images/pixiePerilousness.json");

  //2.2.1 Create seamless background
  clouds = new TilingSprite(
    Texture.from("clouds.png"),
    renderer.screen.width,
    renderer.screen.height
  );
  gameScene.addChild(clouds);

  //2.2.2 Create blocks
  blocks = new Container();
  gameScene.addChild(blocks);
  numberOfPillars = 15;
  gapSize = 4;
  for (let i = 0; i < numberOfPillars; i++) {
    //1. Random number of blocks of pillar
    let blocksPillar = randomInt(0, 5);
    //2. Render pillars
    for (let j = 0; j < 8; j++) {
      if (j < blocksPillar || j >= blocksPillar + gapSize) {
        let block = u.sprite(Texture.from("greenBlock.png"));
        blocks.addChild(block);
        block.x = i * 384 + 500;
        block.y = j * 64;
      }
    }
    if (i > 0 && i % 5 === 0) {
      gapSize -= 1;
    }

    if (i === numberOfPillars - 1) {
      finishSprite = u.sprite(Texture.from("finish.png"));
      blocks.addChild(finishSprite);
      finishSprite.x = numberOfPillars * 384 + 800;
      finishSprite.y = renderer.view.height / 2 - finishSprite.height / 2;
    }
  }
  //2.2.3 Render pixie
  pixie = u.sprite([
    Texture.from("0.png"),
    Texture.from("1.png"),
    Texture.from("2.png")
  ]);
  gameScene.addChild(pixie);
  pixie.x = 150;
  pixie.y = 32;
  pixie.vx = 0;
  pixie.vy = 2;
  pixie.oldVy = pixie.vy;
  pixie.fps = 100;
  // pixie.playAnimation()
  //2.2.4 Particle effect
  dustFrames = [
    Texture.from("pink.png"),
    Texture.from("violet.png"),
    Texture.from("yellow.png")
  ];
  starsStream = d.emitter(500, () =>
    d.create(
      pixie.x,
      pixie.y + pixie.height / 2,
      () => u.sprite(dustFrames),
      gameScene,
      3,
      0,
      true,
      2.4,
      3.6,
      18,
      24,
      2,
      3,
      0.005,
      0.01,
      0.005,
      0.01,
      0.05,
      0.1
    )
  );
  starsStream.play();

  //3. Make a pointer
  pointer = t.makePointer();
  pointer.tap = () => {
    pixie.vy = -3;
  };

  //4 State
  state = play;

  app.ticker.add(delta => {
    gameLoop(delta);
  });
}

//3. Play
function play(delta) {
  pixie.vy += 0.1;
  pixie.y += pixie.vy;
  clouds.tilePosition.x -= 1;
  if (finishSprite.getGlobalPosition().x > 256) {
    blocks.x -= 2;
  }
  d.update();
  t.update();

  // Hit block

  let pixieVsBlock = blocks.children.some(block => {
    return b.hitTestRectangle(pixie, block, true);
  });
  if (pixie.vy < pixie.oldVy) {
    if (!starsStream.playing && pixie.visible) {
      starsStream.play();
    }
    if (!pixie.animating) {
      pixie.playAnimation();
    }
    starsStream.play();
  }

  if (pixie.vy > 0 && pixie.oldVy > 0) {
    if (starsStream.playing) {
      starsStream.stop();
    }
    if (pixie.animating) {
      pixie.stopAnimation;
      pixie.show(0);
    }
  }

  pixie.oldVy = pixie.vy;
  if (pixieVsBlock || (pixie.y > renderer.height && pixie.visible)) {
    pixie.visible = false;
    if (!isDead) {
      hit.play();
      isDead = true;
    }
    // Sound.utils.playOnce()
    d.create(
      pixie.centerX,
      pixie.centerY, //x and y position
      () => u.sprite(dustFrames), //Particle sprite
      gameScene, //The parent container
      30, //Number of particles
      0, //Gravity
      false, //Random spacing
      0,
      6.28, //Min/max angle
      16,
      32, //Min/max size
      1,
      3 //Min/max speed
    );
    wait(2000).then(() => reset());
  }

  if (pixie.y < 0 && pixie.visible) {
    pixie.vy = -pixie.vy;
  }
}

//5. Functions:
function gameLoop(delta) {
  state(delta);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function wait(duration = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, duration);
  });
}

function reset() {
  blocks.x = 0;
  pixie.visible = true;
  pixie.y = 32;
  pixie.vy = 0;
  isDead = false;
}
