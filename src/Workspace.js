import { h, Component, render,createRef } from 'preact';
import htm from 'htm';
import CodeEditor from './components/CodeEditor.js'
import Icon from './components/Icon.js'
import EditorActions from './components/EditorActions.js'
import Accordion from './components/Accordion.js'
import {Environment, Agent, Directions, AgentActions} from './simulation/Environment.js'
import Drawing from './simulation/Drawing.js'
import Logger from './logging/Logger.js'

const LOG = new Logger('workspace');

// Initialize htm with Preact
const html = htm.bind(h);

class Workspace extends Component {

    constructor(props) {
        super(props)
        this.canvas = createRef();
        this.state = {
            script: {
                name: null,
                code: ` //Initial script
for(let p = 0; p < 3; p++){

    for(let j = 0; j < 4; j++){
        agent.move(UP)
        for(let k = 0; k < 6; k++){

            agent.place(DOWN)
            agent.move(FORWARD)

            
        }
        agent.turn(LEFT)

    }
}
        
for(let p = 0; p < 3; p++){

    for(let j = 0; j < 4; j++){
        agent.move(UP)
        for(let k = 0; k < 6; k++){

            agent.place(DOWN)
            agent.move(BACK)

            
        }
        agent.turn(RIGHT)

    }
}
` 
            },
            running: false
        };
    }
    componentDidMount() {
        this.reset()
    }
    updateState(update) {
        LOG.debug('updateState', update)
        this.setState(state => Object.assign(state, update))
    }
    pause() {
        //Maybe it is not event possible, but if frame() is called before having
        //captured the promise given by the environment, let's just remove the pause
        this.updateState({pause: true, frame: () => this.updateState({pause: false})})
    }
    stepFW() {
        if (this.state.pause || !this.state.exec) {
            this.state.frame()
        }
    }
    play() {
        LOG.debug("play", this.state.pause, this.state.exec)
        if (this.state.pause) {
            this.setState(state => {
                //This need to be async as the promise chains can get back
                // to some Workspace method before having updated the state
                //Should we break the rules and directly update the state
                // without calling the 'setState' 🤔
                setImmediate(state.frame)
                return Object.assign(state, {pause: false, frame: null})
            })
        }
        else if (!this.state.exec) {
            this.setState(state => {
                this.executeCode(state.script.code, state.agent)
                    .then(() => this.updateState({exec: false}))
                return Object.assign(state, {exec: true})
            })
        }
    }
    reset() {
        if (this.state.env) {
            this.state.env.shutdown();
            this.updateState({pause: false, exec: false})
        }
        let drawing = new Drawing(this.canvas.current)
        let env = new Environment()
        var self = this;
        env.addListener(function(changes, resolve) {
            LOG.debug('request animation frame');

            window.requestAnimationFrame(() => {
                LOG.debug('drawing');
                
                drawing.clean()
                changes.blocks
                    .forEach(block => drawing.drawBlock(block))

                if (self.state.pause) {
                    self.updateState({frame: resolve})
                } 
                else {
                    resolve()
                }
            })
            
        })
        let agent = new Agent(env)
        this.updateState({env, agent})
    }
    executeCode(code, agent) {
        let globalVars = Object.keys(Directions)
            .reduce((agg, k) => `${agg}const ${k} = ${Directions[k]};`, '')
            
        let methods = Object.keys(AgentActions)
                            .reduce((agg, k) => `${k}|${agg}`)
        let regex = new RegExp(`agent\\.((${methods})\\(.*?\\))`, 'g')
        
        code = code.replace(regex, 'await agent.$1')
            
        let ctx = {};
        new Function(`"use strict"; ${globalVars} this.script = async function(agent) { ${code}\n }`)
            .apply(ctx)
            
        return ctx.script.apply(null, [agent])
    }
    
    frame(callback = () => {}) {
        // if (this.state.agent.processNextCommand()) {
        //     window.requestAnimationFrame(() => {
        //         this.state.env.drawChanges();
        //         setImmediate(callback)
        //     })
        // } else {
        //     this.updateState({running: false})
        // }
    }
    codeUpdated(code) {
        this.updateState({script: {
            name: this.state.script.name,
            code: code,
            modified: true
        }})
    }
    onLoadFile(script) {
        this.updateState({script: script})
    }
    onDeletedFile(f) {
        this.updateState({script: {
            name: this.state.script.name,
            code: this.state.script.code,
            modified: f == this.state.script.name
        }})
    }
    render() {
        LOG.debug('render component:', this.state.pause, this.state.exec)
        let sections = [
            {
                icon: "code",
                title: `Code Editor ${this.state.script.name ? `[${this.state.script.name}${this.state.script.modified ? '*' : ''}]` : ''}`,
                body: html`<${CodeEditor} script=${this.state.script} onLoadFile=${this.onLoadFile.bind(this)} 
                                          onCodeChange=${this.codeUpdated.bind(this)} onDeletedFile=${this.onDeletedFile.bind(this)}
                                          onSaveFile=${() => this.updateState({script: {name: this.state.script.name, code: this.state.script.code}})} />`,
                options: {
                    body: {
                        class: 'pl-0 pt-0 pr-0 editor'
                    }
                }
            },
            {
                icon: "cogs",
                title: "Execution",
                body: html`
                    <div class="container-fluid">
                        <${EditorActions} process=${this.state} onPause=${this.pause.bind(this)} 
                                          onStepFW=${this.stepFW.bind(this)} onRun=${this.play.bind(this)}
                                          onReset=${this.reset.bind(this)} />
                    </div>
                `
            }
        ]
        return html`
            <div class="row">
                <div class="col-4 side-editor p-0">
                    <${Accordion} sections=${sections} />
                </div>
                <div class="col">
                    <canvas ref=${this.canvas} id='canvas' style="width: 100%; height: 35em"></canvas>
                </div>
            </div>
        `;
    }
}

export default Workspace;