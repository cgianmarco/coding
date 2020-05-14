// var canvas = document.getElementById('canvas'),
// 			context = canvas.getContext('2d'),
// 			width = canvas.width = canvas.offsetWidth,
// 			height = canvas.height = canvas.offsetHeight

class Drawing {
    constructor(canvas) {
        this.canvas = canvas;
		this.context = canvas.getContext('2d');
		this.width = canvas.width = canvas.offsetWidth,
		this.height = canvas.height = canvas.offsetHeight
    }
	clean() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawPolygon(points, color){
		this.context.strokeStyle = Drawing.rgb(0, 0, 0);
		this.context.beginPath()
		this.context.moveTo(...points[0])

		for(let i = 1; i < points.length; i++)
			this.context.lineTo(...points[i])
            this.context.closePath()

        this.context.fillStyle = color;
        this.context.fill();
		// context.stroke()
	}

	static rgb(r, g, b){
  		return ["rgb(",r,",",g,",",b,")"].join("");
	}

	static HSVtoRGB(h, s, v) {
	    let r, g, b, i, f, p, q, t;

	    i = Math.floor(h * 6);
	    f = h * 6 - i;
	    p = v * (1 - s);
	    q = v * (1 - f * s);
	    t = v * (1 - (1 - f) * s);
	    switch (i % 6) {
	        case 0: r = v, g = t, b = p; break;
	        case 1: r = q, g = v, b = p; break;
	        case 2: r = p, g = v, b = t; break;
	        case 3: r = p, g = q, b = v; break;
	        case 4: r = t, g = p, b = v; break;
	        case 5: r = v, g = p, b = q; break;
	    }
	    return [
	        Math.round(r * 255),
	        Math.round(g * 255),
	        Math.round(b * 255)
	   ];
	}

	static RGBtoHSV(r, g, b) {
	    let max = Math.max(r, g, b), min = Math.min(r, g, b),
	        d = max - min,
	        h,
	        s = (max === 0 ? 0 : d / max),
	        v = max / 255;

	    switch (max) {
	        case min: h = 0; break;
	        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
	        case g: h = (b - r) + d * 2; h /= 6 * d; break;
	        case b: h = (r - g) + d * 4; h /= 6 * d; break;
	    }

	    return [ h, s, v ]
	}

	static scaleColorHeight(color, z){
		let max_z = parseInt(Math.min(...color) / 10)
		let dark = [color[0]-max_z*10, color[1]-max_z*10, color[2]-max_z*10]
		let TOP = Drawing.rgb(...dark)

		if (z <= max_z)
			TOP = Drawing.rgb(color[0]-z*10, color[1]-z*10, color[2]-z*10)

		return TOP
	}

	static scaleColorSide(color){
		let hsv = Drawing.RGBtoHSV(...color)
		if(hsv[0] + SHADING_H > 1)
			hsv[0] = hsv[0] + SHADING_H - 1
		else
			hsv[0] = hsv[0] + SHADING_H
		hsv[2] = Math.min(hsv[2] + SHADING_V, 1)
		return [Drawing.rgb(...color), Drawing.rgb(...Drawing.HSVtoRGB(...hsv))]


	}
}


// const SIDE_DEFAULT = [70, 57, 150]
// const RIGHT_COLOR = Drawing.rgb(198, 106, 93);
// const TOP_DEFAULT = Drawing.rgb(172-8*10, 214-8*10, 6);
const SHADING_H = 0.05
const SHADING_V = 0.2

export default Drawing;