FORWARD = 0
BACK = 1
LEFT = 2
RIGHT = 3
UP = 4
DOWN = 5

MOVE = 'move'
TURN = 'turn'
PLACE = 'place'

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


function binarySearch(arr, x, map){

	var mapped = map(x)

	let recursiveFunction = function (arr, x, map, start, end) {

       
	    // Base Condition 
	    if (start > end) return false; 
	   
	    // Find the middle index 
	    let mid=Math.floor((start + end)/2); 
	   
	    // Compare mid with given key x 
	    if (arraysEqual(arr[mid],x)) return true; 
	          
	    // If element at mid is greater than x, 
	    // search in the left half of mid 
	    if(map(arr[mid]) > mapped)  
	        return recursiveFunction(arr, x, map, start, mid-1); 
	    else
	        // If element at mid is smaller than x, 
	        // search in the right half of mid 
	        return recursiveFunction(arr, x, map, mid+1, end); 
	}



	return recursiveFunction(arr, x, map, 0, arr.length)
}


 


function howToSort(block1, block2){
			return block1[0] + block1[1] + block1[2] - block2[0] - block2[1] - block2[2]
}

function distance(block){
	return block[0] + block[1] + block[2]
}


class Environment {
	constructor(){
		this.conf = []
		for(let i = -20; i < 20; i++)
			for(let j = -20; j < 20; j++)
				this.conf.push([i, j, 0])

		this.pos = [8, 8, 1]
		this.direction = [0, -1]
		// this.draw()
	}

	isInConf(coord){
		// hashmap
		// for(let i = 0; i < this.conf.length; i++){
		// 	var current = this.conf[i]
		// 	var same = true
		// 	for(let j = 0; j < coord.length; j++)
		// 		if(coord[j] != current[j])
		// 			same = false
		// 	if(same)
		// 		return true			
		// }
		// return false
		return binarySearch(this.conf, coord, distance)
	}

	getAbsoluteDirection(relative){
		let dir = [0,0,0]

		if(relative == LEFT){
			if(this.direction[0] != 0)
				dir = [0, -this.direction[0], 0]
			else
				dir = [this.direction[1], 0, 0]
		}

		if(relative == RIGHT){
			if(this.direction[0] != 0)
				dir = [0, this.direction[0], 0]
			else
				dir = [-this.direction[1], 0, 0]
		}

		if(relative == FORWARD)
			dir = [this.direction[0], this.direction[1], 0]

		if(relative == BACK)
			dir = [-this.direction[0], -this.direction[1], 0]

		if(relative == UP)
			dir = [0, 0, 1]
		if(relative == DOWN)
			dir =  [0, 0, -1]

		return dir
	}

	move(relative){
		let pos = this.pos

		let direction = this.getAbsoluteDirection(relative)

		

		let newpos = [pos[0] + direction[0],
				  pos[1] + direction[1],
				  pos[2] + direction[2]]
		if(!this.isInConf(newpos))
			this.pos = newpos
	}

	turn(relative){
		let dir = [0, 0, 0]

		if(relative == LEFT){
			if(this.direction[0] != 0)
				dir = [0, -this.direction[0]]
			else
				dir = [this.direction[1], 0]
		}

		if(relative == RIGHT){
			if(this.direction[0] != 0)
				dir = [0, this.direction[0]]
			else
				dir = [-this.direction[1], 0]
		}

		this.direction = dir
	}

	place(relative){

		let direction = this.getAbsoluteDirection(relative)

		let newpos = [this.pos[0] + direction[0],
					this.pos[1] + direction[1],
					this.pos[2] + direction[2]]
					
		if(!this.isInConf(newpos)){
			this.conf.push(newpos)
			this.conf = this.conf.sort(howToSort)
		}

	}

}



class Agent {
	constructor(env) {
        this.commands = []
        this.env = env
    }
    move(direction) {
       this.commands.push([MOVE, direction])
    }
    turn(direction) {
        this.commands.push([TURN, direction])
    }
    place(direction) {
        this.commands.push([PLACE, direction])
    }

    run(command, direction){
    	if(command == MOVE)
    		this.env.move(direction)
    	if(command == TURN)
    		this.env.turn(direction)
    	if(command == PLACE)
    		this.env.place(direction)
    }
}

var env = new Environment()
var agent = new Agent(env)