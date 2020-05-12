import { h, Component, render,createRef } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
import Icon from './Icon.js'
// Initialize htm with Preact
const html = htm.bind(h);

function tooltip(elem, text) {
    // tippy(elem, {
    //     content: text
    // })
}
class CodeEditor extends Component {
    editor = createRef();
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
    }
    render(props) {
        let codeMirror = this.codeMirror;
        let actions = [
            {
                title: "Undo",
                icon: 'undo',
                fn: e => codeMirror.undo()
            },
            {
                title: "Redo",
                icon: 'redo',
                fn: e => codeMirror.undo()
            },
            {
                title: "Format",
                icon: 'indent',
                fn: e => {
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
        ]
        .map((action, idx) => html`
            <button ref=${elem => tooltip(elem, action.title)} class="btn btn-light ${idx > 0 ? 'border-left' : ''}" onClick=${action.fn}>
                <${Icon} icon=${action.icon} />
            </button>
        `)
        return html`
            <div class="row">
                <div class="col btn-group border-bottom">
                    ${actions}
                </div>
            </div>
            <div class="side-editor">
                <textarea ref=${this.editor}>${props.code}</textarea>
            </div>
        `
    }
}
export default CodeEditor;