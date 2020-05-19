
const tileWidth = 20;
const tileHeight = tileWidth / 2;

function getPolygons(z, posx, posy) {
    let points_top = [[posx, posy - z * tileHeight],
    [posx + tileWidth / 2, posy + tileHeight / 2 - z * tileHeight],
    [posx, posy + tileHeight - z * tileHeight],
    [posx - tileWidth / 2, posy + tileHeight / 2 - z * tileHeight]];

    let points_left = [[posx - tileWidth / 2, posy + tileHeight / 2 - z * tileHeight],
    [posx, posy + tileHeight - z * tileHeight],
    [posx, posy + tileHeight - (z - 1) * tileHeight],
    [posx - tileWidth / 2, posy + tileHeight / 2 - (z - 1) * tileHeight]];

    let points_right = [[posx + tileWidth / 2, posy + tileHeight / 2 - z * tileHeight],
    [posx, posy + tileHeight - z * tileHeight],
    [posx, posy + tileHeight - (z - 1) * tileHeight],
    [posx + tileWidth / 2, posy + tileHeight / 2 - (z - 1) * tileHeight]];

   	return [points_top, points_left, points_right]

}


const POLYGONS = getPolygons(0, tileWidth/2, 0)
const REGIONS = POLYGONS.map( (points,i)=>{
    const REGION = new Path2D();
    //REGION.beginPath()
    REGION.moveTo(points[0][0], points[0][1])

    for (let i = 1; i < points.length; i++){
      REGION.lineTo(points[i][0], points[i][1])
    }
    REGION.closePath()
    return REGION
})



function initializeCanvas(canvas, colors){
	let ctx = canvas.getContext('2d')

  REGIONS.forEach((region,i)=>{
    ctx.strokeStyle = Drawing.rgb(40,40,40)
    ctx.lineWidth = 0.2
    ctx.stroke(region)
    ctx.fillStyle = colors[i];
    ctx.fill(region);
  })
}


function createCube(colors){
    let canvas = null
    if (typeof OffscreenCanvas !== "undefined") {
        canvas =  new OffscreenCanvas(tileWidth,2 * tileHeight)
    } else {
        //Once Firefox will start supporting this, all major browser will work with the other branch
        //You can check support status on https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas
        canvas = document.createElement('canvas')
    }

    initializeCanvas(canvas, colors)

  	return function(ctx, x, y){
      ctx.drawImage(canvas, x, y)
  	}

 }

const COLOR_CACHE = {
  height: {},
  side: {}
}

class Drawing {
  constructor(canvas) {
  	this.cubeCache = {}
    this.canvas = canvas;
    this.context = canvas.getContext('2d');
    this.width = canvas.width = canvas.offsetWidth,
      this.height = canvas.height = canvas.offsetHeight
  }

  drawBlock(block) {

    let [x, y, z] = block.coords

    x = x - z
    y = y - z

    let top_color = Drawing.rgb(...block.top)
    let left_color = Drawing.rgb(...block.left)
    let right_color = Drawing.rgb(...block.right)

    this.drawCube(x, y, top_color, left_color, right_color)
  }

  clean() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }


  getCube(top_color, left_color, right_color){
  	let cubeID = [top_color, left_color, right_color]
  	let cube = this.cubeCache[cubeID]

  	if(!cube){
  		cube = createCube(cubeID)
  		this.cubeCache[cubeID] = cube
  	}

  	return cube

  }

  drawCube(x, y, top_color, left_color, right_color){

  	let posx = this.width / 2 + (x - y) * tileWidth / 2 - tileWidth/2;
    let posy = this.height / 2 + 50 + (x + y) * tileHeight / 2;

  	let cube = this.getCube(top_color, left_color, right_color)
  	cube(this.context, posx, posy)

  }

  static rgb(r, g, b) {
    return 'rgb(' + r + ',' + g + ',' + b + ')';
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
      case r: h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d; break;
      case g: h = (b - r) + d * 2; h /= 6 * d; break;
      case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return [h, s, v]
  }

  static scaleColorHeight(color, z) {
    let cache = COLOR_CACHE.height[color];
    let entry = cache && cache[z]
    if (entry) {
      return entry;
    }
    let max_z = parseInt(Math.min(...color) / 10) - 2
    let dark = [color[0] - max_z * 10, color[1] - max_z * 10, color[2] - max_z * 10]
    let TOP = dark

    if (z <= max_z)
      TOP = [color[0] - z * 10, color[1] - z * 10, color[2] - z * 10]

    if (cache) {
      cache[z] = TOP
    }
    else {
      cache = []
      cache[z] = TOP
      COLOR_CACHE[color] = cache
    }
    return TOP
  }

  static scaleColorSide(color) {
    let cached = COLOR_CACHE.side[color]
    if (cached) {
      return cached;
    }
    let hsv = Drawing.RGBtoHSV(...color)
    if (hsv[0] + SHADING_H > 1)
      hsv[0] = hsv[0] + SHADING_H - 1
    else
      hsv[0] = hsv[0] + SHADING_H
    hsv[2] = Math.min(hsv[2] + SHADING_V, 1)

    let res = Drawing.HSVtoRGB(...hsv);
    COLOR_CACHE.side[color] = res
    return res


  }
}


// const SIDE_DEFAULT = [70, 57, 150]
// const RIGHT_COLOR = Drawing.rgb(198, 106, 93);
// const TOP_DEFAULT = Drawing.rgb(172-8*10, 214-8*10, 6);
const SHADING_H = 0.05
const SHADING_V = 0.2

export default Drawing;
