import { Block } from "./Environment.js"
import Drawing from "./Drawing.js"



const TOP_DEFAULT = [172, 214, 86]
const SIDE_DEFAULT = [135, 57, 81]

const tileWidth = 24;
const tileHeight = tileWidth / 2;


let sortBlocks = function (b1, b2) {

  let diff = b1.coords[2] - b2.coords[2]

  if (diff == 0)
    return b1.coords[0] + b1.coords[1] - b2.coords[0] - b2.coords[1]

  else
    return diff

}

function getMaxZ(blocks) {

  return blocks[0]

}


class Environment {
  constructor(canvas) {
    this.drawing = new Drawing(canvas);

    this.conf = {}

    for (let i = -20; i < 20; i++)
      for (let j = -20; j < 20; j++) {

        let newpos = [i, j, 0]
        let block = Block.TerrainBlock(newpos, TOP_DEFAULT, SIDE_DEFAULT)

        this.place(newpos, block)

      }

    this.drawChanges()
  }


  isInConf(coords) {
    let [x, y, z] = coords
    let i = x - z
    let j = y - z

    let diag = this.conf[[i, j]]

    if (diag) {
      return diag.find(e => z == e.coords[2])
    }

    return null
  }


  place(coords, block) {

    // console.log(coords)

    let [x, y, z] = coords
    let i = x - z
    let j = y - z

    block.coords = coords

    let diag = this.conf[[i, j]]
    if (!diag || diag.length == 0)
      this.conf[[i, j]] = [block]
    else {
      if (z > diag[0].coords[2])
        diag.unshift(block)
      else
        diag.push(block)
    }



  }

  destroy(coords) {

    let [x, y, z] = coords
    let i = x - z
    let j = y - z

    let diag = this.conf[[i, j]]
    if (diag) {
      diag.splice(diag.findIndex(e => z == e.coords[2]), 1)
      if (diag.length == 0)
        delete this.conf[[i, j]]
    }



  }


  shift(oldpos, newpos) {
    let block = this.isInConf(oldpos)

    if (block) {
      this.destroy(oldpos)
      this.place(newpos, block)
    }

  }

  static getPolygons(z, posx, posy, top_color, left_color, right_color) {
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

    return [
      {
        points: points_top,
        color: top_color

      },
      {
        points: points_left,
        color: left_color
      },
      {
        points: points_right,
        color: right_color
      },
    ]
  }
  drawBlock(block) {

    let [x, y, z] = block.coords

    x = x - z
    y = y - z

    let top_color = Drawing.rgb(...block.top)
    let left_color = Drawing.rgb(...block.left)
    let right_color = Drawing.rgb(...block.right)


    let posx = this.drawing.width / 2 + (x - y) * tileWidth / 2 - tileWidth/2;
    let posy = this.drawing.height / 2 + 50 + (x + y) * tileHeight / 2;

    let cube = this.drawing.drawCube(posx, posy, top_color, left_color, right_color)


    // let polygons = Environment.getPolygons(z, posx, posy, top_color, left_color, right_color)

    // //polygons.forEach(polygon => this.drawing.drawPolygon(polygon.points, polygon.color))
    // for (var i = 0; i < polygons.length; i++) {
    //   let polygon = polygons[i]
    //   this.drawing.drawPolygon(polygon.points, polygon.color)
    // }

  }

  drawChanges() {
    this.drawing.clean()
    Object.values(this.conf)
      .map(getMaxZ)
      .sort(sortBlocks)
      .forEach(this.drawBlock.bind(this))

  }
}

export { Environment }