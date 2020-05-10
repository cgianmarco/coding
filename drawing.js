var canvas = document.getElementById('canvas'),
			context = canvas.getContext('2d'),
			width = canvas.width = window.innerWidth,
			height = canvas.height = window.innerHeight;


var tileWidth = 20;
var tileHeight = 10;

const LEFT_COLOR = rgb(135, 57, 81);
const RIGHT_COLOR = rgb(198, 106, 93);
const TOP_DEFAULT = rgb(172-8*10, 214-8*10, 6);


function drawBlock(coords){

	[x, y, z] = coords

	if (z * 10 < 86)
		TOP = rgb(172-z*10, 214-z*10, 86-z*10);
	else 
		TOP = TOP_DEFAULT
	

	posx = width / 2 + (x - y) * tileWidth / 2;
	posy = height/2 - 50 + (x + y) * tileHeight / 2;
	points_top = [[posx, posy - z * tileHeight], 
	  			  [posx + tileWidth/2, posy + tileHeight/2 - z * tileHeight],
	  			  [posx, posy + tileHeight - z * tileHeight],
	  			  [posx - tileWidth/2, posy + tileHeight/2 - z * tileHeight]];

	points_left = [[posx - tileWidth/2, posy + tileHeight/2 - z * tileHeight],
				   [posx, posy + tileHeight - z * tileHeight],
			  	   [posx, posy + tileHeight - (z-1) * tileHeight],
			  	   [posx - tileWidth/2, posy + tileHeight/2 - (z-1) * tileHeight]];

	points_right = [[posx + tileWidth/2, posy + tileHeight/2 - z * tileHeight],
				    [posx, posy + tileHeight - z * tileHeight],
			  	    [posx, posy + tileHeight - (z-1) * tileHeight],
			  	    [posx + tileWidth/2, posy + tileHeight/2 - (z-1) * tileHeight]];
	drawPolygon(points_top, TOP);
	drawPolygon(points_left, LEFT_COLOR);
	drawPolygon(points_right, RIGHT_COLOR);

}

function rgb(r, g, b){
  return ["rgb(",r,",",g,",",b,")"].join("");
}


function drawPolygon(points, color){
	context.strokeStyle = '#000000'
	context.beginPath()
	context.moveTo(...points[0])
	context.lineTo(...points[1])
	context.lineTo(...points[2])
	context.lineTo(...points[3])
	context.closePath()

	context.fillStyle = color;
	context.fill();
	// context.stroke()
}