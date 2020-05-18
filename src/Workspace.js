import { h, Component, render,createRef } from 'preact';
import htm from 'htm';
import CodeEditor from './components/CodeEditor.js'
import Icon from './components/Icon.js'
import EditorActions from './components/EditorActions.js'
import Accordion from './components/Accordion.js'
import {Environment, Agent, Directions} from './simulation/Environment.js'

// Initialize htm with Preact
const html = htm.bind(h);

class Workspace extends Component {

    constructor(props) {
        super(props)
        this.perf = []
        this.canvas = createRef();
        this.state = {
            running: false,
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
        };
    }
    componentDidMount() {
        let env = new Environment(this.canvas.current);
        this.updateState({env: env, agent: new Agent(env)})
        env.drawChanges()
    }
    updateState(update) {
        this.setState(state => Object.assign(state, update))
    }
    pause() {
        this.updateState({running: false})
    }
    stepFW() {
        this.executeCode()
        this.frame();
    }
    reset() {
        let env = new Environment(this.canvas.current)
        let agent = new Agent(env)
        this.updateState({env, agent})
        env.drawChanges()
    }
    runCode() {
        if (this.state.running) {
            return;
        }
        this.executeCode()
        this.updateState({running: this.state.agent.commands.length})
        this.perf.push(performance.now() )
        console.log(this.perf)
        this.play();
    }
    executeCode() {
        if (this.state.agent.commands.length == 0) {
            let globalVars = Object.keys(Directions)
                .reduce((agg, k) => `${agg}const ${k} = ${Directions[k]};`, '')
            let ctx = {};
            let code = this.state.code.replace(/agent\.((asyncCommand|check)\(.*?\))/g, 'await agent.$1')
            new Function(`"use strict"; ${globalVars} this.script = async function(agent) { ${code}\n }`)
                .apply(ctx)

            ctx.script.apply(null, [this.state.agent])
        }
    }
    play() {
        function loop() {
            if (this.state.running) {
                this.frame(loop.bind(this))
            }
        }
        setTimeout(loop.bind(this), 0)
    }
    frame(callback = () => {}) {

        if (this.state.agent.processNextCommand()) {
            window.requestAnimationFrame(() => {
                this.state.env.drawChanges();
                setImmediate(callback)
            })

        } else {
            this.updateState({running: false})
            this.perf.push(performance.now() )
            console.log(this.perf)
            console.log(`Took ${this.perf.pop() - this.perf.pop()} milliseconds.`)
        }
    }
    codeUpdated(code) {
        this.updateState({code: code})
    }
    render() {
        let sections = [
            {
                icon: "code",
                title: 'Code Editor',
                body: html`<${CodeEditor} onUpdate=${this.codeUpdated.bind(this)} code=${this.state.code}/>`,
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
                                          onStepFW=${this.stepFW.bind(this)} onRun=${this.runCode.bind(this)}
                                          onReset=${this.reset.bind(this)} />
                    </div>
                `
            }
        ]
        console.log('render workspace')
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
