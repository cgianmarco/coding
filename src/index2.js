import { Environment, Agent, Directions } from './simulation/Environment.js'

 
var canvas = document.createElement('canvas');
canvas.width  = window.innerWidth;
canvas.height = window.innerHeight;
canvas.id = 'someId';
 
document.body.appendChild(canvas);
 
window.onload = function () {
 
  let env = new Environment(canvas)
  let agent = new Agent(env)
 
  //Initial script
  for (let p = 0; p < 3; p++) {
 
    for (let j = 0; j < 4; j++) {
      agent.move(Directions.UP)
      for (let k = 0; k < 6; k++) {
 
        agent.place(Directions.DOWN)
        agent.move(Directions.FORWARD)
 
 
      }
      agent.turn(Directions.LEFT)
 
    }
  }
 
  for (let p = 0; p < 3; p++) {
 
    for (let j = 0; j < 4; j++) {
      agent.move(Directions.UP)
      for (let k = 0; k < 6; k++) {
 
        agent.place(Directions.DOWN)
        agent.move(Directions.BACK)
 
 
      }
      agent.turn(Directions.RIGHT)
 
    }
  }
 
 
 
 
  function draw() {
    env.drawChanges()
  }
 
  function update() {
    return agent.processNextCommand()
 
  }
 
  function loop() {
    if (update()) {
      draw()
      window.requestAnimationFrame(loop)
 
    }
  }
 
  window.requestAnimationFrame(loop)
}