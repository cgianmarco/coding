import {add, matrix, multiply} from 'mathjs';
import Drawing from './Drawing.js'
import Logger from '../logging/Logger.js'

const ENV_LOG = new Logger('simulation.environment')
const AGENT_LOG = new Logger('simulation.agent')

const math = {
    add, matrix, multiply
}

// const TOP_DEFAULT = [172, 214, 86]
const SIDE_DEFAULT = [85,20,0]
const TOP_DEFAULT = [134,158,121]

const tileWidth = 20;
const tileHeight = tileWidth / 2;



const AGENT_FRONT_COLOR = [140, 50, 60]
const AGENT_BACK_COLOR = [50, 60, 140]
const AGENT_GENERAL_COLOR = [0, 0, 0]

var AGENT_CONFIGS = {}
AGENT_CONFIGS[[1, 0, 0]] = {
		top : AGENT_GENERAL_COLOR,
		left : AGENT_GENERAL_COLOR,
		right : AGENT_FRONT_COLOR
	}
AGENT_CONFIGS[[-1, 0, 0]] =  {
		top : AGENT_GENERAL_COLOR,
		left : AGENT_GENERAL_COLOR,
		right : AGENT_BACK_COLOR
	},
AGENT_CONFIGS[[0, 1, 0]] = {
		top : AGENT_GENERAL_COLOR,
		left : AGENT_FRONT_COLOR,
		right : AGENT_GENERAL_COLOR
	}
AGENT_CONFIGS[[0, -1, 0]] = {
		top : AGENT_GENERAL_COLOR,
		left : AGENT_BACK_COLOR,
		right : AGENT_GENERAL_COLOR
	}


const FORWARD = 0
const BACK = 1
const LEFT = 2
const RIGHT = 3
const UP = 4
const DOWN = 5
const Directions = {FORWARD, BACK, LEFT, RIGHT, UP, DOWN}

const LEFT_ROT = math.matrix([[0, 1, 0],
				   [-1, 0, 0],
		           [0, 0, 0]])

const RIGHT_ROT = math.matrix([[0, -1, 0],
				    [1, 0, 0],
		            [0, 0, 0]])

function sortBlocks(b1, b2) {

  let diff = b1.coords[2] - b2.coords[2]

  if (diff == 0)
    return b1.coords[0] + b1.coords[1] - b2.coords[0] - b2.coords[1]

  else
    return diff

}

function getMaxZ(blocks) {

  return blocks[0]

}
const TerrainGenerators = {
  'none': {
      label: 'None',
      icon: 'circle-notch',
      strategy: () => []
  },
  'simple': {
      label: 'Plane',
      icon: 'border-all',
      strategy: function() {
          var blocks = []
          for (let i = -20; i < 20; i++) {
              for (let j = -20; j < 20; j++) {
                  let newpos = [i, j, 0]
                  let block = Block.TerrainBlock(newpos, TOP_DEFAULT, SIDE_DEFAULT)
                  
                  blocks.push([newpos, block])
              }
          }
          return blocks;
      }
  },
  'maze': {
    label: 'Maze',
    icon: 'dice-d20',
    strategy: function() {
      let width = 36;
      let height = width;
      let hw = Math.floor(width / 2);
      let hh = Math.floor(height / 2); //half width and height, used to translate (x, y) to real position
      let maze = []
      let block = (x, y, z) => [[x - hw, y - hh, z || 1], Block.TerrainBlock([x - hw, y - hh, z || 1], SIDE_DEFAULT, SIDE_DEFAULT)];
      let random = (start, end) => Math.floor(Math.random() * (end - start)) + start
      let middle = (a, b) => Math.floor(a + ((b - a) / 2))
      const min = width / 8;
      function recursiveMaze(x1, x2, y1, y2) {
        if ((x2 - x1) < min || (y2 - y1) < min) {
          return
        }
        let mx = middle(x1, x2)
        let my = middle(y1, y2)
        let openX1 = random(x1, mx - 1, mx);
        let openX2 = random(mx + 1, x2, mx);
        let openY1 = random(y1, my - 1, my);
        let openY2 = random(my + 1, y2, my);
        for (var x = x1 ; x < x2 ; x++) {
          if (x != openX1 && x != openX2 && x != hw) {
            maze.push(block(x, my))
          }
        }
        for (var y = y1 ; y < y2 ; y++) {
          if (y != openY1 && y != openY2 && y != hh) {
            maze.push(block(mx, y))
          }
        }
        recursiveMaze(x1, mx, y1, my)
        recursiveMaze(x1, mx, my, y2)
        recursiveMaze(mx, x2, y1, my)
        recursiveMaze(mx, x2, my, y2)
      }
      recursiveMaze(0, width, 0, height)
      for (var x = 0 ; x <= width ; x++) {
        for (var y = 0 ; y <= height ; y++) {
          maze.push(block(x, 0))
          maze.push(block(x, height))
          maze.push(block(0, y))
          maze.push(block(width, y))
        }
      }
      return maze.concat(TerrainGenerators.simple.strategy())
    }
  }
}

class Environment {
  constructor(generator) {
    this.listeners = [];
    this.commandsQueue = []
    this.conf = {}
    ENV_LOG.info('generator', generator)
    generator.strategy().forEach(([pos, block])=> this.place(pos, block))
  }


  isInConf(coords) {
    let [x, y, z] = coords
    let i = x - z
    let j = y - z

    let diag = this.conf[[i, j]]

    if (diag) {
      return diag.find(e => z == e.coords[2])
    }

    return null
  }


  place(coords, block) {

    // console.log(coords)

    let [x, y, z] = coords
    let i = x - z
    let j = y - z

    block.coords = coords

    let diag = this.conf[[i, j]]
    if (!diag || diag.length == 0)
      this.conf[[i, j]] = [block]
    else {
      if (z > diag[0].coords[2])
        diag.unshift(block)
      else
        diag.push(block)
    }



  }

  destroy(coords) {

    let [x, y, z] = coords
    let i = x - z
    let j = y - z

    let diag = this.conf[[i, j]]
    if (diag) {
      diag.splice(diag.findIndex(e => z == e.coords[2]), 1)
      if (diag.length == 0)
        delete this.conf[[i, j]]
    }



  }


  shift(oldpos, newpos) {
    let oldBlock = this.isInConf(oldpos)
    let newBlock = this.isInConf(newpos)
    if (oldBlock && !newBlock ) {
      this.destroy(oldpos)
      this.place(newpos, oldBlock)
      return newpos
    }else{
      return oldpos
    }

  }

  transact(...commands) {
    return new Promise(
      (resolve, reject) => {
        let invalid = commands.filter(cmd => !this[cmd[0]])
        if (invalid && invalid.length) {
          throw new Error('Invalid commands: ' + invalid)
        }
        this.commandsQueue.push([commands, resolve, reject])

        ENV_LOG.debug('running', this.running);
        if (!this.running) {
          loop(this)
        }
      }
    )
  }
  /**
   * A listener is a function (changes, resolve)=>void
   * @param {Function} listener
   */
  addListener(listener) {
    this.listeners.push(listener)
    const changes = {
      blocks: Object.values(this.conf)
          .map(getMaxZ)
          .sort(sortBlocks)
    }
    listener(changes, () => {}) //trigger the listener with current state
  }
  shutdown() {
    //Release everything, I hope 🤞🏻
    this.listeners = null
    this.commandsQueue = null
  }
}
function loop(env) {
  var next = env.commandsQueue.shift()
  ENV_LOG.debug('loop', next)
  if (next) {
    env.running = true
    let [commands, resolve, reject] = next
    ENV_LOG.debug('next', [commands, resolve, reject])
    try {
      const result = commands.map(([cmd, ...args]) => {
        ENV_LOG.debug('env ->', cmd, args);

        return env[cmd].apply(env, args)
      })
      const changes = {
        blocks: Object.values(env.conf)
          .map(getMaxZ)
          .sort(sortBlocks),
        /*
          Events can be used to indicate something that happened in that transaction (a block has appear)
          It can be used for partial rendering or triggers other stuffs (sounds?).
          Rendering is just a kind of listener, sounds, AI or other kind of reactive behaviors
          can be triggered using the listeners.
          An event can be generated by the environment functions (shift, destroy, place)
          Thinking also to stuffs like agent.move(FORWARD) against a block ('movement blocked' event)
          to trigger a sound during rendering
        */
        events: null
      };
      Promise.all(
        env.listeners.map(listener => new Promise((r) => listener(changes, r)))
      )
      .then(() => {
        ENV_LOG.debug('resolve for code');

        resolve(result) //this is needed in order to resolve the promise returned to the user script
                //rendering and script execution should be considered totally unrelated processes
                //the renderer is a listener (but maybe also this 🤔, now it is easier in this way)
      })
      .then(() => loop(env))
      //after all the listeners completed their work loop again!


    }
    catch(e) {
      console.error('Error executing a batch the batch of commands', next, e)
      reject(e)
    }
  }
  else {
    env.running = false
  }
}

class Block{
	static TerrainBlock(coords, top = TOP_DEFAULT, side = SIDE_DEFAULT){
		let z = coords[2]
		let scaledTop = Drawing.scaleColorHeight(top, z)
		let lightSide = Drawing.scaleColorSide(side)
		return new Block(scaledTop, side, lightSide)
	}

	static AgentBlock(direction){
		let colors = AGENT_CONFIGS[direction]
		return new Block(colors.top, colors.left, colors.right)
	}

	static WhiteBlock(){
		return new Block(WHITE, WHITE, WHITE)
	}

	constructor(top, left, right){
		this.top = top
		this.left = left
		this.right = right
	}
}

const AgentActions = {
  move: {
        fn: function (relative){
          let absolute = this.getAbsoluteDirection(this.direction, relative)
          let newpos = math.add(this.position, absolute)
          return this.env.transact(['shift', this.position, newpos])
            .then(function(actualPosition){
              this.position = actualPosition[0]
            }.bind(this))
        },
        description: 'Move the agent in a direction. It can move for multiple steps.',
        arguments: [
          {
            name: 'direction',
            description: `One of ${Object.keys(Directions).map(d => `Directions.${d}`)}`
          },
          {
            name: 'steps',
            description: 'Number of steps to do'
          }
        ],
        example: `
agent.move(Directions.FORWARD)
agent.move(Directions.BACK, 3)
`,
      },
      turn: {
        fn: function (relative) {
          // this.env.destroy(this.position)
          this.direction = this.getAbsoluteDirection(this.direction, relative)
          return this.env.transact(
            ['destroy', this.position],
            ['place', this.position, Block.AgentBlock(this.direction)]
          )
        },
        description: 'Turn the agent in a direction.',
        arguments: [
          {
            name: 'direction',
            description: `One of ${Object.keys(Directions).map(d => `Directions.${d}`)}`
          }
        ],
        example: 'agent.turn(Directions.RIGHT)'
      },
      place: {
        fn: function (relative) {
          let absolute = this.getAbsoluteDirection(this.direction, relative)
          let newpos = math.add(this.position, absolute)
          // this.env.place(newpos, Block.TerrainBlock(newpos, this.block_colors.top, this.block_colors.side))
          return this.env.transact(
            ['place', newpos, Block.TerrainBlock(newpos, this.block_colors.top, this.block_colors.side)]
          )
        },
        description: 'The agent place a block in the passed direction',
        arguments: [
          {
            name: 'direction',
            description: `One of ${Object.keys(Directions).map(d => `Directions.${d}`)}`
          },
          {
            name: 'color',
            description: `The colors of the block`
          }
        ],
        example: `
agent.place(Directions.DOWN)
agent.place(Directions.UP, {top: [255, 75, 80], side: [255, 250, 230]})
`
      },
      destroy: {
        fn: function (relative) {
          let absolute = this.getAbsoluteDirection(this.direction, relative)
          let newpos = math.add(this.position, absolute)
          return this.env.transact(['destroy', newpos])
        },
        description: 'The agent destroy a block in the passed direction',
        arguments: [
          {
            name: 'direction',
            description: `One of ${Object.keys(Directions).map(d => `Directions.${d}`)}`
          }
        ],
        example: `
agent.place(Directions.DOWN)
agent.place(Directions.UP, {top: [255, 75, 80], side: [255, 250, 230]})
`
      },
      setColor: {
        fn: function (color) {
          this.block_colors = color
          return Promise.resolve(true)
        },
        description: 'Change the color for new blocks',
        arguments: [
          {
            name: 'color',
            description: 'The new colors for a block'
          }
        ],
        example: `
agent.set_color({[200, 230 , 250], [255, 230, 200]})
`
      },
      check: {
        fn: function (direction, resolve) {
          let absolute = this.getAbsoluteDirection(this.direction, direction)
          let newpos = math.add(this.position, absolute)
          // resolve(this.env.isInConf(newpos))
          return Promise.resolve(this.env.isInConf(newpos))
        },
        description: 'Check what there is in the direction choosed.',
        arguments: [
          {
            name: 'direction',
            description: `One of ${Object.keys(Directions).map(d => `Directions.${d}`)}`
          }
        ],
        example: `
if (agent.check(FORWARD)){
   agent.turn(RIGHT)
}
`
      }
}
class Agent {
	constructor(env) {
	    this.commands = []
		this.env = env
		this.position = [0,0,1]
		this.direction = [0, -1, 0]
		this.block_colors = {
			top : TOP_DEFAULT,
      side : SIDE_DEFAULT
		}

		if(!this.env.isInConf(this.position)){
			let block = Block.AgentBlock(this.direction)
			this.env.transact(['place', this.position, block])
		}
	}

	getAbsoluteDirection(direction, relative){

		if(relative == LEFT)
			return math.multiply(LEFT_ROT, direction).toArray()

		if(relative == RIGHT)
			return math.multiply(RIGHT_ROT, direction).toArray()

		if(relative == FORWARD)
			return direction

		if(relative == BACK)
			return math.multiply(-1, direction)

		if(relative == UP)
			return [0, 0, 1]
		if(relative == DOWN)
			return [0, 0, -1]

	}
}
Object.keys(AgentActions)
  //AgentActions[action].fn can be composed with validation automatically generated by description
  .forEach(action => Agent.prototype[action] = function (){
    AGENT_LOG.debug('agent -> ', action, arguments)
    return AgentActions[action].fn.apply(this, arguments)
  })

export {
  Environment,
  Directions,
  Agent,
  AgentActions,
  Block,
  TerrainGenerators
}
