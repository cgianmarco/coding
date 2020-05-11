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
 


function howToSort(block1, block2){
	return block1[0] + block1[1] + block1[2] - block2[0] - block2[1] - block2[2]
}


function distance(coord){
	return coord[0] + coord[1] + coord[2]
}

class Environment {

	constructor(){
		this.lastInserted = null
		this.pos = [8, 2, 1]
		this.direction = [0, -1, 0]	

		this.conf = []
		for(let i = -20; i < 20; i++)
			for(let j = -20; j < 20; j++)
				this.conf.push([i, j, 0])

		this.conf = this.conf.sort(howToSort)	
	}


	blockOnLeft(coord){
		return math.add([0, 1, 0], coord)
	}

	blockOnRight(coord){
		return math.add([1, 0, 0], coord)
	}

	blockOnTop(coord){
		return math.add([0, 0, 1], coord)
	}

	blockOnTopRight(coord){
		return math.add([1, 0, 1], coord)
	}

	blockOnTopLeft(coord){
		return math.add([0, 1, 1], coord)
	}

	blockInFront(coord){
		return math.add([1, 1, 0], coord)
	}

	
	isInConf(coord){
		return binarySearch(this.conf, coord, distance) > -1
	}

	insert(newpos){
		if(!this.isInConf(newpos)){
			this.conf.push(newpos)
			this.conf.sort(howToSort)
			return binarySearch(this.conf, newpos, distance)
		}

		return null

		
		// if(this.conf.length == 0){
		// 	this.conf.push(newpos)
		// 	return 0
		// }else{
		// 	let i = 0;
			
		// 	while(distance(newpos) > distance(this.conf[i])){
				
		// 		if(i == this.conf.length - 1)
		// 			break
		// 		i = i + 1
		// 	}
		// 	if(arraysEqual(newpos, this.conf[i]))
		// 		return null
		// 	else{
		// 		this.conf = this.conf.slice(0, i).concat([newpos], this.conf.slice(i, this.conf.length))
		// 		return i
		// 	}

		// }		
		
	}


	getAbsoluteDirection(relative){

		if(relative == LEFT)
			return math.multiply(LEFT_ROT, this.direction).toArray()

		if(relative == RIGHT)
			return math.multiply(RIGHT_ROT, this.direction).toArray()

		if(relative == FORWARD)
			return this.direction

		if(relative == BACK)
			return math.multiply(-1, this.direction)

		if(relative == UP)
			return [0, 0, 1]
		if(relative == DOWN)
			return [0, 0, -1]

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

		// if(!this.isInConf(newpos)){
		// 	this.conf.push(newpos)
		// 	this.conf = this.conf.sort(howToSort)
		// }

	}


	drawBlock(coords){

		let [x, y, z] = coords
		let TOP = TOP_DEFAULT

		if (z * 10 < 86)
			TOP = rgb(172-z*10, 214-z*10, 86-z*10)
		

		let posx = width / 2 + (x - y) * tileWidth / 2;
		let posy = height/2 - 50 + (x + y) * tileHeight / 2;


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


		let draw_top_left = true
		let draw_top_right = true
		let draw_left_down = true
		let draw_left_top = true
		let draw_right_down = true
		let draw_right_top = true


		for(let k = 0; k < 20; k++){

			if(this.isInConf(math.add(coords, [1+k,1+k,1+k]))){
				draw_top_left = false
				draw_top_right = false
				draw_left_top = false
				draw_left_down = false
				draw_right_top = false
				draw_right_down = false
			}
			if(this.isInConf(math.add(this.blockOnTop(coords), [k,k,k]))){
				draw_top_left = false
				draw_top_right = false
			}

			if(this.isInConf(math.add(this.blockOnTopLeft(coords), [k,k,k])))
				draw_top_left = false

			if(this.isInConf(math.add(this.blockOnTopRight(coords), [k,k,k])))
				draw_top_right = false

			if(this.isInConf(math.add(this.blockOnLeft(coords), [k,k,k]))){
				draw_left_top = false
				draw_left_down = false
			}
			if(this.isInConf(math.add(this.blockOnRight(coords), [k,k,k]))){
				draw_right_top = false
				draw_right_down = false
			}
			if(this.isInConf(math.add(this.blockInFront(coords), [k,k,k]))){
				draw_right_down = false
				draw_left_down = false
			}
		}

		//console.log(coords)

		if(draw_top_left)
			drawPolygon(points_top_left, TOP)
		if(draw_top_right)
			drawPolygon(points_top_right, TOP)
		if(draw_left_top)
			drawPolygon(points_left_top, LEFT_COLOR)
		if(draw_left_down)
			drawPolygon(points_left_down, LEFT_COLOR)
		if(draw_right_top)
			drawPolygon(points_right_top, RIGHT_COLOR)
		if(draw_right_down)
			drawPolygon(points_right_down, RIGHT_COLOR)

		// if(!this.hasBlockOnTop(coords))
		// 	drawPolygon(points_top, TOP)
		// if(!this.hasBlockOnLeft(coords))
		// 	drawPolygon(points_left, LEFT_COLOR)
		// if(!this.hasBlockOnRight(coords))
		// 	drawPolygon(points_right, RIGHT_COLOR)

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

