import { h, Component, render,createRef } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
import Icon from './Icon.js'
// Initialize htm with Preact
const html = htm.bind(h);

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
    .map((b, i) => html`
        <button class="btn mr-1 btn ${b.class}" onClick=${b.click}>
            <${Icon} icon=${b.icon} /> ${b.text}
        </button>
    `)
    return html`
        <div class="row">
            <div class="col pt-3 text-right">
                <div class="btn-group" role=button>
                    ${buttons}
                </div>
            </div>
        </div>
    `
}

export default EditorActions;