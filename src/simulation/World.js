import Logger from '../logging/Logger.js'
import {Block} from './Environment.js'

const LOG = new Logger('simulation.world')

const WorldActions = {
    move: {
        fn: function (from, to) {
            return this.env.transact(['shift', from, to])
        },
        description: 'Move the a block from a point to another',
        arguments: [
            {
                name: 'from',
                description: `The coordinates where the block stays`
            },
            {
                name: 'to',
                description: 'To coordinates where the block should go'
            }
        ],
        example: `
world.move([0, 0, 0], [10, 10, 1])
`,
    },
    place: {
        fn: function (coords, color = {}) {
            return this.env.transact(
                ['place', coords, Block.TerrainBlock(coords, color.top, color.side)]
            )
        },
        description: 'Place a block in a point',
        arguments: [
            {
                name: 'coords',
                description: `The point in which the block is place`
            },
            {
                name: 'color',
                description: `The colors of the block`
            }
        ],
        example: `
world.place([0, 0, 1])
agent.place([0, 0, 1], {top: [255, 75, 80], side: [255, 250, 230]})
  `
    },
    destroy: {
        fn: function (coords) {
            return this.env.transact(['destroy', coords])
        },
        description: 'Destroy a block in the passed coordinates',
        arguments: [
            {
                name: 'coords',
                description: `The coordinates of the block to be destroyed`
            }
        ],
        example: `
agent.destroy([40, 40, 0])
`
},
    check: {
        fn: function (coords) {
            return Promise.resolve(this.env.isInConf(coords))
        },
        description: 'Check what there is in the coordinates choosed.',
        arguments: [
            {
                name: 'coords',
                description: `The coordinates to check`
            }
        ],
        example: `
if (world.check([40, 40, 0])){
    agent.destroy([40, 40, 0])
}
else {
    agent.place([40, 40, 0])
}
  `
    }
}
class World {
    constructor(env) {
        this.env = env
    }
}
Object.keys(WorldActions)
  //AgentActions[action].fn can be composed with validation automatically generated by description
  .forEach(action => World.prototype[action] = function (){
    LOG.debug('world -> ', action, arguments)
    return WorldActions[action].fn.apply(this, arguments)
  })

export default World;