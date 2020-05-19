import {add, matrix, multiply} from 'mathjs';
import Drawing from './Drawing.js'

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



// const ADJACENTS = {
// 	top : [0,0,1],
// 	topLeft : [0,1,1],
// 	topRight : [1,0,1],
// 	left : [0,1,0],
// 	right : [1,0,0],
// 	frontDown : [1,1,0],
// 	frontUp : [1,1,1],
// }


// const TOP_LEFT = [ ADJACENTS['top'], ADJACENTS['topLeft'], ADJACENTS['frontUp'] ]
// const TOP_RIGHT = [ ADJACENTS['top'], ADJACENTS['topRight'], ADJACENTS['frontUp'] ]
// const LEFT_TOP = [ ADJACENTS['topLeft'], ADJACENTS['left'], ADJACENTS['frontUp'] ]
// const LEFT_DOWN = [ ADJACENTS['left'], ADJACENTS['frontDown'], ADJACENTS['frontUp'] ]
// const RIGHT_TOP = [ ADJACENTS['topRight'], ADJACENTS['right'], ADJACENTS['frontUp'] ]
// const RIGHT_DOWN = [ ADJACENTS['right'], ADJACENTS['frontDown'], ADJACENTS['frontUp'] ]




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


function arraysEqual(a, b) {
	if (a === b) return true;
	if (a == null || b == null) return false;
	if (a.length != b.length) return false;

	// If you don't care about the order of the elements inside
	// the array, you should sort both arrays here.
	// Please note that calling sort on an array will modify that array.
	// you might want to clone your array first.

	for (var i = 0; i < a.length; ++i) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}


function any(arr, condition){
	for(let i = 0; i < arr.length; i++)
		if(condition(arr[i]))
			return true
	return false
}


function howToSort(block1, block2){
	return block1[0] + block1[1] + block1[2] - block2[0] - block2[1] - block2[2]
}


function distance(coord){
	return coord[0] + coord[1] + coord[2]
}


class Environment {
  constructor(canvas) {
    this.drawing = new Drawing(canvas);

    this.conf = {}

    for (let i = -20; i < 20; i++)
      for (let j = -20; j < 20; j++) {

        let newpos = [i, j, 0]
        let block = Block.TerrainBlock(newpos, TOP_DEFAULT, SIDE_DEFAULT)

        this.place(newpos, block)

      }

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
    let block = this.isInConf(oldpos)

    if (block) {
      this.destroy(oldpos)
      this.place(newpos, block)
    }

  }




  drawBlock(block) {

    let [x, y, z] = block.coords

    x = x - z
    y = y - z

    let top_color = Drawing.rgb(...block.top)
    let left_color = Drawing.rgb(...block.left)
    let right_color = Drawing.rgb(...block.right)

    let cube = this.drawing.drawCube(x, y, top_color, left_color, right_color)

  }

  drawChanges() {
    this.drawing.clean()
    Object.values(this.conf)
      .map(getMaxZ)
      .sort(sortBlocks)
      .forEach(this.drawBlock.bind(this))

  }
}


class Block{
	static TerrainBlock(coords, top, side){
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

const DEFAULT_COLORS = { 
  top : TOP_DEFAULT,
  side : SIDE_DEFAULT
};
const AgentActions = {
  MOVE: {
        fn: function (relative){
          let absolute = this.getAbsoluteDirection(this.direction, relative)
          let newpos = math.add(this.position, absolute)
          if(!this.env.isInConf(newpos)){
            this.env.shift(this.position, newpos)
            this.position = newpos
          }
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
      TURN: {
        fn: function (relative) {
          this.env.destroy(this.position)
          this.direction = this.getAbsoluteDirection(this.direction, relative)
          this.env.place(this.position, Block.AgentBlock(this.direction))
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
      PLACE: {
        fn: function (relative) {
          let absolute = this.getAbsoluteDirection(this.direction, relative)
          let newpos = math.add(this.position, absolute)
          this.env.place(newpos, Block.TerrainBlock(newpos, this.block_colors.top, this.block_colors.side))
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
      DESTROY: {
        fn: function (relative) {
          let absolute = this.getAbsoluteDirection(this.direction, relative)
          let newpos = math.add(this.position, absolute)
          this.env.destroy(newpos)
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
      SET_COLOR: {
        fn: function (color) {
          this.block_colors = color
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
      CHECK: {
        fn: function (direction, resolve) {
          let absolute = this.getAbsoluteDirection(this.direction, direction)
          let newpos = math.add(this.position, absolute)
          resolve(this.env.isInConf(newpos))
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
			this.env.place(this.position, block)
		}
    // return ProxyAgent(this, this.env)
	}

  check(direction) {
    return new Promise(resolve => this.commands.push([AgentActions.CHECK, direction, resolve]))
  }
	move(direction, steps=1) {
		for(let i = 0; i < steps; i++)
	   		this.commands.push([AgentActions.MOVE, direction])
	}
	turn(direction) {
	    this.commands.push([AgentActions.TURN, direction])
	}
	place(direction) {
	    this.commands.push([AgentActions.PLACE, direction])
	}

	destroy(direction) {
	    this.commands.push([AgentActions.DESTROY, direction])
	}

	set_color(colors) {
	    this.commands.push([AgentActions.SET_COLOR, colors])
	}

	processNextCommand() {
		let op = this.commands.shift()
		if (op) {
      let [cmd, ...args] = op;
      cmd.fn.apply(this, args)
      return true
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

export {
  Environment,
  Directions,
  Agent,
  AgentActions,
	Block
}