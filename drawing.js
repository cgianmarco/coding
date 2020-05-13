var canvas = document.getElementById('canvas'),
			context = canvas.getContext('2d'),
			width = canvas.width = canvas.offsetWidth,
			height = canvas.height = canvas.offsetHeight


var tileWidth = 22;
var tileHeight = tileWidth / 2;


class Drawing {
	static clean() {
		context.clearRect(0, 0, canvas.width, canvas.height);
	}

	static drawPolygon(points, color){
		context.strokeStyle = Drawing.rgb(0, 0, 0);
		context.beginPath()
		context.moveTo(...points[0])

		for(let i = 1; i < points.length; i++)
			context.lineTo(...points[i])
		context.closePath()

		context.fillStyle = color;
		context.fill();
		// context.stroke()
	}

	static rgb(r, g, b){
  		return ["rgb(",r,",",g,",",b,")"].join("");
	}

	static scaleColorHeight(color, z){
		let max_z = parseInt(Math.min(...color) / 10)
		let dark = [color[0]-max_z*10, color[1]-max_z*10, color[2]-max_z*10]
		let TOP = Drawing.rgb(...dark)

		if (z <= max_z)
			TOP = Drawing.rgb(color[0]-z*10, color[1]-z*10, color[2]-z*10)

		return TOP
	}
}

const LEFT_COLOR = Drawing.rgb(135, 57, 81);
const RIGHT_COLOR = Drawing.rgb(198, 106, 93);
const TOP_DEFAULT = Drawing.rgb(172-8*10, 214-8*10, 6);
const TOP_COLOR = [172,214,86]
