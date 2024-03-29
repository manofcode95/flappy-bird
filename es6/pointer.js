//Aliases
let Container = PIXI.Container,
  autoDetectRenderer = PIXI.autoDetectRenderer;

//Create a Pixi stage and renderer
let stage = new Container(),
  renderer = autoDetectRenderer(512, 512);
document.body.appendChild(renderer.view);

//Set the canvas's border style and background color
renderer.view.style.border = "1px dashed black";
renderer.backgroundColor = "0xFFFFFF";

//let scale = scaleToWindow(renderer.view);

//Set the initial game state
let state = play;

//Define any variables that are used in more than one function
let t, pointer;

setup();

function setup() {

  //Create a new instance of Tink
  t = new Tink(PIXI, renderer.view);
  console.log(t);
  //Create a `pointer` object
  pointer = t.makePointer();

  //Add a custom `press` method
  pointer.press = () => console.log("The pointer was pressed");

  //Add a custom `release` method
  pointer.release = () => console.log("The pointer was released");

  //Add a custom `tap` method
  pointer.tap = () => console.log("The pointer was tapped");

  //Start the game loop
  gameLoop();
}

function gameLoop() {

  //Loop this function 60 times per second
  requestAnimationFrame(gameLoop);

  //Run the current state
  state();

  //Update Tink
  t.update();

  //Render the stage
  renderer.render(stage);
}

function play() {

  //Display the pointer properties in the 
  //HTML <p> tag called `output`
  output.innerHTML
    = `Pointer properties: <br>
    pointer.x: ${pointer.x} <br>
    pointer.y: ${pointer.y} <br>
    pointer.isDown: ${pointer.isDown} <br>
    pointer.isUp: ${pointer.isUp} <br>
    pointer.tapped: ${pointer.tapped}`;
}
