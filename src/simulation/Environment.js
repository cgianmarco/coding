import {add, matrix, multiply} from 'mathjs';
import Drawing from './Drawing.js'

const math = {
    add, matrix, multiply
}
const TOP_DEFAULT = [172,214,86]
const SIDE_DEFAULT = [135, 57, 81]
const WHITE = [255, 255, 255]

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

const MOVE = 'move'
const TURN = 'turn'
const PLACE = 'place'
const DESTROY = 'destroy'
const SET_COLOR = 'set_color'

const LEFT_ROT = math.matrix([[0, 1, 0],
				   [-1, 0, 0],
		           [0, 0, 0]])

const RIGHT_ROT = math.matrix([[0, -1, 0],
				    [1, 0, 0],
		            [0, 0, 0]])



const ADJACENTS = {
	top : [0,0,1],
	topLeft : [0,1,1],
	topRight : [1,0,1],
	left : [0,1,0],
	right : [1,0,0],
	frontDown : [1,1,0],
	frontUp : [1,1,1],
}


const TOP_LEFT = [ ADJACENTS['top'], ADJACENTS['topLeft'], ADJACENTS['frontUp'] ]
const TOP_RIGHT = [ ADJACENTS['top'], ADJACENTS['topRight'], ADJACENTS['frontUp'] ]
const LEFT_TOP = [ ADJACENTS['topLeft'], ADJACENTS['left'], ADJACENTS['frontUp'] ]
const LEFT_DOWN = [ ADJACENTS['left'], ADJACENTS['frontDown'], ADJACENTS['frontUp'] ]
const RIGHT_TOP = [ ADJACENTS['topRight'], ADJACENTS['right'], ADJACENTS['frontUp'] ]
const RIGHT_DOWN = [ ADJACENTS['right'], ADJACENTS['frontDown'], ADJACENTS['frontUp'] ]




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


/*
function binarySearch(arr, x, map){

return arr.findIndex(elem => arraysEqual(elem, x))

// var mapped = map(x)

// let recursiveFunction = function (arr, x, func, start, end) {
   
//     // Base Condition 
//     if (start > end) return -1; 
   
//     // Find the middle index 
//     let mid=Math.floor((start + end)/2); 
   
//     // Compare mid with given key x 
//     if (arraysEqual(arr[mid],x)) return mid; 
          
//     // If element at mid is greater than x, 
//     // search in the left half of mid 
//     if(mid < arr.length)
// 	    if(func(arr[mid]) > mapped)  
// 	        return recursiveFunction(arr, x, func, start, mid-1); 
// 	    else
// 	        // If element at mid is smaller than x, 
// 	        // search in the right half of mid 
// 	        return recursiveFunction(arr, x, func, mid+1, end); 
// }



// return recursiveFunction(arr, x, map, 0, arr.length)
}
*/


function howToSort(block1, block2){
	return block1[0] + block1[1] + block1[2] - block2[0] - block2[1] - block2[2]
}


function distance(coord){
	return coord[0] + coord[1] + coord[2]
}

const tileWidth = 22;
const tileHeight = tileWidth / 2;

class Environment {

	constructor(canvas){
		this.lastInserted = []
		this.drawing = new Drawing(canvas);

		this.conf = {}
		this.drawing.clean()

		for(let i = -20; i < 20; i++)
			for(let j = -20; j < 20; j++) {

				let newpos = [i, j, 0]
				let block = Block.TerrainBlock(newpos, TOP_DEFAULT, SIDE_DEFAULT)

				this.conf[newpos] = block
				this.drawBlock(newpos, block, true)

			}
			
	}


	isInConf(coord){
		// return binarySearch(this.conf, coord, distance) > -1
		return this.conf[coord]
	}

	place(newpos, block){
		if(!this.isInConf(newpos)){
			this.conf[newpos] = block
			// this.conf.sort(howToSort)
			this.lastInserted.push({
				coords: newpos,
				block : block
			})
		}
	}

		
	

	destroy(newpos){
		delete this.conf[newpos]

		let point_behind = this.firstPointOnDiagonal(newpos, -1)
		if (!point_behind){

			let white = Block.WhiteBlock()
			this.lastInserted.push({ 
						coords : newpos,
						block : white
					})
		}

		

		Object.values(ADJACENTS).forEach(e => {
			let startPoint = math.add(newpos, math.multiply(-1, e))
			let firstPoint = this.firstPointOnDiagonal(startPoint, -1)
			if(firstPoint)
				this.lastInserted.push({ 
					coords : firstPoint,
					block : this.conf[firstPoint]
				})
		})

	}

	// direction 1 for forward diagonal, -1 for back diagonal
	firstPointOnDiagonal(start, direction){
		for(let k = 0; k < 50; k++){
			let point = math.add(start, math.multiply(direction, [k,k,k]))
			if(this.isInConf(point))
				return point
		}
		return null
	}



	drawBlock(coords, block, init){

		let [x, y, z] = coords

		let top_color = Drawing.rgb(...block.top)
		let left_color = Drawing.rgb(...block.left)
		let right_color = Drawing.rgb(...block.right)
		

		let posx = this.drawing.width / 2 + (x - y) * tileWidth / 2;
		let posy = this.drawing.height / 2 + 50 + (x + y) * tileHeight / 2;


		let points_top = [[posx, posy - z * tileHeight], 
		  			  [posx + tileWidth/2, posy + tileHeight/2 - z * tileHeight],
		  			  [posx, posy + tileHeight - z * tileHeight],
		  			  [posx - tileWidth/2, posy + tileHeight/2 - z * tileHeight]];

		let points_left = [[posx - tileWidth/2, posy + tileHeight/2 - z * tileHeight],
					   [posx, posy + tileHeight - z * tileHeight],
				  	   [posx, posy + tileHeight - (z-1) * tileHeight],
				  	   [posx - tileWidth/2, posy + tileHeight/2 - (z-1) * tileHeight]];

		let points_right = [[posx + tileWidth/2, posy + tileHeight/2 - z * tileHeight],
					    [posx, posy + tileHeight - z * tileHeight],
				  	    [posx, posy + tileHeight - (z-1) * tileHeight],
				  	    [posx + tileWidth/2, posy + tileHeight/2 - (z-1) * tileHeight]];

		let points_top_left = [points_top[0], points_top[2], points_top[3]]
		let points_top_right = [points_top[0], points_top[1], points_top[2]]

		let points_left_top = [points_left[0], points_left[1], points_left[3]]
		let points_left_down = [points_left[1], points_left[2], points_left[3]]

		let points_right_top = [points_right[0], points_right[1], points_right[3]]
		let points_right_down = [points_right[1], points_right[2], points_right[3]]



		let polygons = [
			{
				points: points_top_left,
				color : top_color,
				blocksToCheck : TOP_LEFT

			},
			{
				points: points_top_right,
				color : top_color,
				blocksToCheck : TOP_RIGHT
			},
			{
				points: points_left_top,
				color : left_color,
				blocksToCheck : LEFT_TOP
			},
			{
				points: points_left_down,
				color : left_color,
				blocksToCheck : LEFT_DOWN
			},
			{
				points: points_right_top,
				color : right_color,
				blocksToCheck : RIGHT_TOP
			},
			{
				points: points_right_down,
				color : right_color,
				blocksToCheck : RIGHT_DOWN
			}
		]

		if (init) {
			polygons.forEach(polygon => this.drawing.drawPolygon(polygon.points, polygon.color))
			return
		}

		

		polygons.forEach(polygon => {
			if(!any(polygon.blocksToCheck, e => this.firstPointOnDiagonal(math.add(e, coords), 1)))
				this.drawing.drawPolygon(polygon.points, polygon.color)
		})

	}


	shift(oldpos, newpos){
		let block = this.isInConf(oldpos)
		this.destroy(oldpos)
		this.place(newpos, block)

	}


	drawChanges() {
		Object.values(this.lastInserted).forEach(e => {
			// console.log(e.block)
			this.drawBlock(e.coords, e.block)
		})
		this.lastInserted = []
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
		
	}


	move(direction, steps=1) {
		for(let i = 0; i < steps; i++)
	   		this.commands.push([MOVE, direction])
	}
	turn(direction) {
	    this.commands.push([TURN, direction])
	}
	place(direction) {
	    this.commands.push([PLACE, direction])
	}

	destroy(direction) {
	    this.commands.push([DESTROY, direction])
	}

	set_color(colors) {
	    this.commands.push([SET_COLOR, colors])
	}

	run(command, relative){

		if(command == MOVE){
			let absolute = this.getAbsoluteDirection(this.direction, relative)
			let newpos = math.add(this.position, absolute)
			if(!this.env.isInConf(newpos)){
				this.env.shift(this.position, newpos)
				this.position = newpos
			}
		}
		if(command == TURN){
			this.env.destroy(this.position)
			this.direction = this.getAbsoluteDirection(this.direction, relative)
			this.env.place(this.position, Block.AgentBlock(this.direction))
		}

		if(command == PLACE){
			let absolute = this.getAbsoluteDirection(this.direction, relative)
			let newpos = math.add(this.position, absolute)
			this.env.place(newpos, Block.TerrainBlock(newpos, this.block_colors.top, this.block_colors.side))
		}

		if(command == DESTROY){
			let absolute = this.getAbsoluteDirection(this.direction, relative)
			let newpos = math.add(this.position, absolute)
			this.env.destroy(newpos)
		}

		if(command == SET_COLOR)
			this.block_colors = relative
	}

	processNextCommand() {
		let op = this.commands.shift()
		if (op) {
			this.run(op[0], op[1])
		}
		return op;
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
	Agent,
	Directions,
	Block
}