var canvas = document.getElementById('canvas'),
			context = canvas.getContext('2d'),
			width = canvas.width = window.innerWidth,
			height = canvas.height = window.innerHeight;


var tileWidth = 20;
var tileHeight = 10;

const LEFT_COLOR = rgb(135, 57, 81);
const RIGHT_COLOR = rgb(198, 106, 93);
const TOP_DEFAULT = rgb(172-8*10, 214-8*10, 6);




function rgb(r, g, b){
  return ["rgb(",r,",",g,",",b,")"].join("");
}




function drawPolygon(points, color){
	context.strokeStyle = rgb(0, 0, 0);
	context.beginPath()
	context.moveTo(...points[0])

	for(let i = 1; i < points.length; i++)
		context.lineTo(...points[i])
	context.closePath()

	context.fillStyle = color;
	context.fill();
	// context.stroke()
}