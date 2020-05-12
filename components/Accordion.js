import { h, Component, render,createRef } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
import Icon from './Icon.js'

// Initialize htm with Preact
const html = htm.bind(h);

class Accordion extends Component {
    constructor(props) {
        super(props)
        this.state = props.sections.map((_, idx) => idx < 2)
    }
    toggle(index) {
        this.setState(state => {
            state[index] = !state[index];
            return state;
        })
    }
    render(props) {
        let read = (prop, v) => prop.reduce((agg, p) => agg && agg[p], v)
        var sections = props.sections
            .map((section, idx) => {
                return html`
                    <div class="card">
                        <div class="card-header">
                            <button class="btn btn-outline-primary btn-sm" type="button" onClick=${this.toggle.bind(this, idx)}>
                                <${Icon} icon="chevron-${this.state[idx] ? 'down' : 'right'}" />
                            </button>
                            <button class="btn btn-link btn-sm" type="button" onClick=${this.toggle.bind(this, idx)} >
                                <${Icon} icon="${section.icon}" /> ${section.title}
                            </button>
                        </div>
                        <div class="border-top collapse ${this.state[idx] ? 'show' : 'hide'}">
                            <div class="card-body ${read(['options', 'body', 'class'], section)}">
                                ${section.body}
                            </div>
                        </div>
                    </div>
                `})
        return html`
            <div class="accordion rounded shadow">
                ${sections}
            </div>
        `
    }
}

export default Accordion;