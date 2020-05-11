import { h, Component, render,createRef } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';

// Initialize htm with Preact
const html = htm.bind(h);

class CodeEditor extends Component {

    editor = createRef();
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
        
        
    ` };

    componentDidMount() {
        this.codeMirror = CodeMirror.fromTextArea(this.editor.current, {
            lineNumbers: true,
            mode:  "javascript"
        });
    }
    pause() {
        this.setState({running: false, code: this.state.code})
    }
    stepFW() {
        this.frame();
    }
    runCode() {
        if (this.state.running) {
            return;
        }
        eval(this.codeMirror.getValue())
        this.setState({running: true, code: this.state.code})
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
            if(env.lastInserted != null)
                env.drawBlock(env.conf[env.lastInserted])
                // env.conf.forEach(v => env.drawBlock(v))
        }
        if (update()) {
            draw()
        }
    }
    render() {
        let buttons = [
            {
                class: 'btn-warning ' + (this.state.running ? '' : 'disabled'),
                click: this.pause.bind(this),
                icon: 'pause'
            },
            {
                class: 'btn-info ' + (this.state.running ? 'disabled' : ''),
                click: this.stepFW.bind(this),
                icon: 'step-forward'
            },
            {
                class: 'btn-info ' + (this.state.running ? 'disabled' : ''),
                click: this.runCode.bind(this),
                icon: 'play',
                text: 'Run'
            }
        ]
        .map((b, i) => html`<button class="btn shadow mr-2 btn ${i > 0 ? 'ml-2' : ''} ${b.class}" onClick=${b.click}><i class="fas fa-${b.icon}"></i> ${b.text}</button>`)

        return html`
            <div class="side-editor">
                <textarea ref=${this.editor} rows="40">${this.state.code}</textarea>
            </div>
            <div class="container-fluid">
                <div class="row border-top">
                    <div class="col pt-3 text-right">
                        ${buttons}
                    </div>
                </div>
            </div>
        `
    }
}
class App extends Component {
    render() {
      return html`
        <${CodeEditor} />
      `;
    }
}
//Start app
render(h(App), document.getElementById('editor'));