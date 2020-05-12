var canvas = document.getElementById('canvas'),
			context = canvas.getContext('2d'),
			width = canvas.width = canvas.offsetWidth,
			height = canvas.height = canvas.offsetHeight


var tileWidth = 26;
var tileHeight = tileWidth / 2;

const LEFT_COLOR = rgb(135, 57, 81);
const RIGHT_COLOR = rgb(198, 106, 93);
const TOP_DEFAULT = rgb(172-8*10, 214-8*10, 6);




function rgb(r, g, b){
  return ["rgb(",r,",",g,",",b,")"].join("");
}


class Drawing {
	static clean() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
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