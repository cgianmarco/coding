import { h, Component, render,createRef } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
// Initialize htm with Preact
const html = htm.bind(h);

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
        return html`
            <div class="side-editor">
                <textarea ref=${this.editor} rows="40">${props.code}</textarea>
            </div>
        `
    }
}
export default CodeEditor;