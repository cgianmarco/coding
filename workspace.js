import { h, Component, render,createRef } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

// Initialize htm with Preact
const html = htm.bind(h);

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
function Icon(props) {
    return html`<i class="fas fa-${props.icon}"></i>`
}
function EditorActions(props) {
    let buttons = [
        {
            class: 'btn-warning ' + (props.running ? '' : 'disabled'),
            click: props.onPause,
            icon: 'pause'
        },
        {
            class: 'btn-info ' + (props.running ? 'disabled' : ''),
            click: props.onStepFW,
            icon: 'step-forward'
        },
        {
            class: 'btn-info ' + (props.running ? 'disabled' : ''),
            click: props.onRun,
            icon: 'play',
            text: 'Run'
        }
    ]
    .map((b, i) => html`<button class="btn shadow mr-2 btn ${i > 0 ? 'ml-2' : ''} ${b.class}" onClick=${b.click}><i class="fas fa-${b.icon}"></i> ${b.text}</button>`)
    return html`
        <div class="row">
            <div class="col pt-3 text-right">
                ${buttons}
            </div>
        </div>
    `
}
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
function Accordion(props) {
    let read = (prop, v) => prop.reduce((agg, p) => agg && agg[p], v)
    var sections = props.sections
        .map((section, idx) => {
            return html`
                <div class="card">
                    <div class="card-header">
                        <button class="btn btn-link btn-sm" type="button" ><${Icon} icon="${section.icon}" /> ${section.title}</button>
                    </div>
                    <div class="collapse ${idx == 0 ? 'show' : 'show'}">
                        <div class="card-body ${read(['options', 'body', 'class'], section)}">
                            ${section.body}
                        </div>
                    </div>
                </div>
            `})
    return html`
        <div class="accordion">
            ${sections}
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