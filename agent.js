FORWARD = 0
BACK = 1
LEFT = 2
RIGHT = 3
UP = 4
DOWN = 5

MOVE = 'move'
TURN = 'turn'
PLACE = 'place'

LEFT_ROT = math.matrix([[0, 1, 0],
					   [-1, 0, 0],
			           [0, 0, 0]])

RIGHT_ROT = math.matrix([[0, -1, 0],
					    [1, 0, 0],
			            [0, 0, 0]])



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



	return recursiveFunction(arr, x, map, 0, arr.length-1)
}




 


function howToSort(block1, block2){
			return block1[0] + block1[1] + block1[2] - block2[0] - block2[1] - block2[2]
}




class Environment {
	constructor(){
		this.lastInserted = 0
		this.pos = [8, 8, 1]
		this.direction = [0, -1, 0]	

		this.conf = []
		for(let i = -20; i < 20; i++)
			for(let j = -20; j < 20; j++)
				this.conf.push([i, j, 0])

		this.conf = this.conf.sort(howToSort)



		
	}

	distance(coord){
		return coord[0] + coord[1] + coord[2]
	}

	isInConf(coord){
		return binarySearch(this.conf, coord, this.distance)
	}

	getAbsoluteDirection(relative){

		if(relative == LEFT)
			return math.multiply(LEFT_ROT, this.direction).toArray()

		if(relative == RIGHT)
			return math.multiply(RIGHT_ROT, this.direction).toArray()

		if(relative == FORWARD)
			return this.direction

		if(relative == BACK)
			return -1 * this.direction

		if(relative == UP)
			return [0, 0, 1]
		if(relative == DOWN)
			return [0, 0, -1]

	}

	insert(newpos){

		
		if(this.conf.length == 0){
			this.conf.push(newpos)
			return 0
		}else{
			let i = 0;
			
			while(this.distance(newpos) > this.distance(this.conf[i])){
				
				if(i == this.conf.length - 1)
					break
				i = i + 1
			}
			if(arraysEqual(newpos, this.conf[i]))
				return null
			else{
				this.conf = this.conf.slice(0, i).concat([newpos], this.conf.slice(i, this.conf.length))
				return i - 1
			}

		}

		



				
		
	}

	move(relative){
		let direction = this.getAbsoluteDirection(relative)		
		let newpos = math.add(this.pos, direction)

		if(!this.isInConf(newpos))
			this.pos = newpos

	}

	turn(relative){
		this.direction = this.getAbsoluteDirection(relative)
	}

	place(relative){

		let direction = this.getAbsoluteDirection(relative)
		let newpos = math.add(this.pos, direction)
		this.lastInserted = this.insert(newpos)
		// this.conf = this.conf.sort(howToSort)

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