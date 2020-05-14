import { h, Component, render,createRef } from 'preact';
import htm from 'htm';
import Icon from './Icon.js'
import ScriptsManager from './ScriptsManager.js'
import CodeMirror from 'codemirror/lib/codemirror.js'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/addon/lint/lint.js'
import 'codemirror/addon/lint/javascript-lint.js'
import 'codemirror/mode/javascript/javascript.js'
import 'jshint'
import tippy from 'tippy.js'
import 'tippy.js/dist/tippy.css'
window.JSHINT = require('jshint').JSHINT

// Initialize htm with Preact
const html = htm.bind(h);

function tooltip(button) {
    tippy(button.ref.current, {
        content: button.title
    })
}
class CodeEditor extends Component {
    constructor(props) {
        super(props)
        this.editor = createRef();
        this.buttons = [
            {
                title: "Undo",
                icon: 'undo',
                fn: codeMirror => codeMirror.undo()
            },
            {
                title: "Redo",
                icon: 'redo',
                fn: codeMirror => codeMirror.redo()
            },
            {
                title: "Format",
                icon: 'indent',
                fn: codeMirror => {
                    let cursor = codeMirror.getCursor();
                    codeMirror.setSelection(
                        {
                            'line':codeMirror.firstLine(),
                            'ch':0,
                            'sticky':null
                        },
                        {
                            'line':codeMirror.lastLine(),
                            'ch':0,
                            'sticky':null
                        },
                        {scroll: false}
                    );
                    //auto indent the selection
                    codeMirror.indentSelection("smart");
                    codeMirror.setCursor(cursor)
                }
            }
        ].map(button => {
            button.ref = createRef()
            return button;
        });
    }
    componentDidMount() {
        this.codeMirror = CodeMirror.fromTextArea(this.editor.current, {
            lineNumbers: true,
            mode:  "javascript",
            gutters: ["CodeMirror-lint-markers"],
            lint: {
                "esversion": 6,
                "asi": true
              }
            // lintFix: { getFixes: getFixes }
        });
        this.codeMirror.on('change', event => this.props.onUpdate(this.codeMirror.getValue()))
        this.buttons.forEach(tooltip)
    }
    onLoadScript(script) {
        console.log(script)
        this.codeMirror.setValue(script.code)
    }
    render(props) {
        let actions = this.buttons.map((action, idx) => html`
            <button ref=${action.ref} title="${action.title}" class="btn btn-light ${idx > 0 ? 'border-left' : ''}" onClick=${() => action.fn(this.codeMirror)}>
                <${Icon} icon=${action.icon} />
            </button>
        `)
        if (this.codeMirror && props.code != this.codeMirror.getValue()) {
            this.codeMirror.setValue(props.code)
        }
        return html`
            <div class="row border-bottom">
                <${ScriptsManager} onLoadScript=${this.onLoadScript.bind(this)} code=${this.codeMirror && this.codeMirror.getValue()} />
            </div>
            <div class="row">
                <div class="col btn-group border-bottom">
                    ${actions}
                </div>
            </div>
            <div class="side-editor">
                <textarea ref=${this.editor}></textarea>
            </div>
        `
    }
}
export default CodeEditor;