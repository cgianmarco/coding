import { h, Component, render,createRef } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
import CodeEditor from './components/CodeEditor.js'
import Icon from './components/Icon.js'
import EditorActions from './components/EditorActions.js'
import Accordion from './components/Accordion.js'

// Initialize htm with Preact
const html = htm.bind(h);

/*
class CodeEditor extends Component {
    editor = createRef();
    componentDidMount() {
        this.codeMirror = CodeMirror.fromTextArea(this.editor.current, {
            lineNumbers: true,
            mode:  "javascript"
        });
        this.codeMirror.on('change', event => this.props.onUpdate(this.codeMirror.getValue()))
    }
    render(props) {
        return html`
            <div class="side-editor">
                <textarea ref=${this.editor} rows="40">${props.code}</textarea>
            </div>
        `
    }
}
*/

function CommandsQueue(props) {
    return html`
        <div class="row">
            <div class="col pt-3">
                <div class="alert alert-info">
                    <${Icon} icon="stream" /> <span>actions to complete</span> <span class="badge badge-pill badge-info">${props.queue}</span>
                </div>
            </div>
        </div>
    `
}

class App extends Component {
    state = { 
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
    pause() {
        this.setState({running: false})
    }
    stepFW() {
        this.frame();
    }
    runCode() {
        if (this.state.running) {
            return;
        }
        eval(this.state.code)
        this.setState({running: true})
		window.requestAnimationFrame(this.loop.bind(this))
    }
    loop() {
        if (this.state.running) {
            this.frame();
            window.requestAnimationFrame(this.loop.bind(this));
        }
    }
    frame() {
        function update() {
            if(agent.commands.length > 0){
                var op = agent.commands.shift()
                agent.run(op[0], op[1])
                return true;
            }
            return false
        }

        function draw() {
                env.lastInserted.forEach(e => env.drawBlock(e))
                env.lastInserted = []
        }
        if (update()) {
            draw()
            this.setState({running: this.state.running, code: this.state.code, queue: agent.commands.length})
        } else {
            this.setState({running: false, code: this.state.code})
        }
    }
    codeUpdated(code) {
        this.setState({running: this.state.running, code: code})
    }
    render() {
        let queue = this.state.queue ? html`<${CommandsQueue} queue=${this.state.queue} />` : null
        let sections = [
            {
                icon: "code",
                title: 'Code Editor',
                body: html`<${CodeEditor} onUpdate=${this.codeUpdated.bind(this)} code=${this.state.code}/>`,
                options: {
                    body: {
                        class: 'pl-0 pt-1 pr-0'
                    }
                }
            },
            {
                icon: "cogs",
                title: "Execution",
                body: html`
                    <div class="container-fluid">
                        <${EditorActions} running=${this.state.running} onPause=${this.pause.bind(this)} 
                                          onStepFW=${this.stepFW.bind(this)} onRun=${this.runCode.bind(this)} />
                        ${queue}
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