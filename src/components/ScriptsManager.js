import { h, Component, render,createRef } from 'preact';
import htm from 'htm';
import Icon from './Icon.js'
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css'

// Initialize htm with Preact
const html = htm.bind(h);
const storage = window.localStorage;
const SCRIPT_NAMESPACE = 'it.coding.scripts'

const scriptKey = (name) => `${SCRIPT_NAMESPACE}.${name}`
const Scripts = {
    entries: () => Array(storage.length).fill(null)
                    .map((_, i) => storage.key(i))
                    .filter(k => k.indexOf(SCRIPT_NAMESPACE) == 0)
                    .map(k => k.substr(SCRIPT_NAMESPACE.length + 1)),
    load: name => storage.getItem(scriptKey(name)),
    store: (name, content) => storage.setItem(scriptKey(name), content)
}
function tooltip(button) {
    return tippy(button.ref.current, {
        content: button.title
    })
}
function partition(spacing, input){
    var output = [];
    for (var i = 0; i < input.length; i += spacing){
        output[output.length] = input.slice(i, i + spacing);
    }
    return output;
}
class ActionButton extends Component {
    constructor(props) {
        super(props)
        this.ref = createRef();
    }
    componentDidMount(){
        this.tippy = tooltip({
            ref: this.ref,
            title: this.ref.current['title']
        })
        this.ref.current['title'] = '';
    }
    componentWillUnmount() {
        this.tippy.destroy();
    }
    render(props) {
        return html`
            <button ref=${this.ref} title=${props.title} class="btn-${props.type} ${props.extraClass || ''}" onClick=${props.onClick} >
                <${Icon} icon="${props.icon}" size=${props.iconSize} /> ${props.text}
            </button>
        `
    }
}
function ScriptsCarousel(props){
    var items = partition(
        2,
        Scripts.entries()
            .sort()
            .map(k => html`
                <div class="d-flex flex-row p-0 text-left w-50 script">
                    <div class="btn-group w-100 p-1">
                        <${ActionButton} type="danger" title="Delete" icon="trash" extraClass="rounded-left"
                                         onClick=${() => alert('Not implemented!')} />
                        <${ActionButton} type="primary" text=${k} title="Open" icon="file-code" extraClass="rounded-right w-100"
                                         onClick=${() => props.onLoadScript({name: k, code: Scripts.load(k)})} />
                    </div>
                </div>
            `)
    )
    .map((entries, idx) => html`
        <div class="row code-editor-scripts-carousel border-top">${entries}</div>
    `)
    return html`
        <div class="pt-2">${items}</div>
    `
}
class ScriptsManager extends Component {
    constructor(props) {
        super(props)
        this.state = {
            files: false,
            current: null
        }
        this.buttons = [
            {
                class: 'btn-light',
                click: e => this.updateState({files: !this.state.files}),
                icon: 'folder-open',
                title: 'Load Script'
            },
            {
                class: 'btn-light',
                click: e => {
                    let name = prompt("File name");
                    Scripts.store(name, this.props.code)
                },
                icon: 'save',
                title: 'Save'
            }
        ].map(button => {
            button.ref = createRef()
            return button;
        });
    }
    updateState(update) {
        this.setState(state => Object.assign(state, update))
    }
    componentDidMount() {
        this.buttons.forEach(tooltip)
    }
    render(props) {
        this.buttons[0].class = `btn-light ${this.state.files ? 'active' : ''}`
        let buttons = this.buttons.map((b, i) => html`
            <button ref=${b.ref} class="btn col btn ${b.class} ${i > 0 ? 'border-left' : ''}" onClick=${b.click}>
                <${Icon} icon=${b.icon} />
            </button>
        `)
        var files = this.state.files ? html`<${ScriptsCarousel} onLoadScript=${props.onLoadScript}/>` : ''
        return html`
            <div class="col btn-group">
                <div class="container-fluid">
                    <div class="row ${this.state.files ? 'shadow' : ''}">
                        ${buttons}
                    </div>
                    ${files}
                </div>
            </div>
        `
    }
}
Scripts.store('Prova', `
agent.move(UP);
agent.place(DOWN);
`)

Scripts.store('Prova2', `
agent.move(UP);
agent.place(DOWN);
agent.move(FORWARD);
agent.place(DOWN);
`)
export default ScriptsManager;