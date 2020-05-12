import { h, Component, render,createRef } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
import CodeEditor from './components/CodeEditor.js'
import Icon from './components/Icon.js'
import EditorActions from './components/EditorActions.js'
import Accordion from './components/Accordion.js'

// Initialize htm with Preact
const html = htm.bind(h);

class App extends Component {
    static makeEvalContext (declarations) {
        eval(declarations);
        return function (str) { eval(str); }
    }
    constructor(props) {
        super(props)
        let env = new Environment();
        this.state = { 
            env: env,
            agent: new Agent(env),
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
        window.requestAnimationFrame(this.frame.bind(this));
    }
    pause() {
        this.setState({running: false})
    }
    stepFW() {
        this.executeCode()
        window.requestAnimationFrame(this.frame.bind(this));
    }
    reset() {
        let env = new Environment()
        let agent = new Agent(env)
        this.updateState({env, agent})
        window.requestAnimationFrame(this.frame.bind(this));
    }
    runCode() {
        if (this.state.running) {
            return;
        }
        this.executeCode()
        this.updateState({running: true})
        window.requestAnimationFrame(this.play.bind(this));
    }
    play() {
        if (this.state.running) {
            window.requestAnimationFrame(e => {
                this.frame()
                setTimeout(this.play.bind(this), 0)
            });
        } 
    }
    updateState(update) {
        this.setState(state => Object.assign(state, update))
    }
    frame() {
        if (this.state.agent.processNextCommand()) {
            this.updateState({})
        } else {
            this.updateState({running: false})
        }
        this.state.env.drawChanges();
    }
    executeCode() {
        if (this.state.agent.commands.length == 0) {
            let ctx = {};
            new Function(`"use strict"; this.script = function(agent) { ${this.state.code}\n }`)
                .apply(ctx) //🤯
            ctx.script.apply(null, [this.state.agent])
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
                        class: 'pl-0 pt-0 pr-0'
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
        return html`
            <${Accordion} sections=${sections} />
        `;
    }
}
//Start app
render(h(App), document.getElementById('editor'));