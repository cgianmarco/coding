import { h, Component, render,createRef } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
import Icon from './Icon.js'
// Initialize htm with Preact
const html = htm.bind(h);

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

function EditorActions(props) {
    let queue = props.process.agent.commands.length > 0 && html`<${CommandsQueue} queue=${props.process.agent.commands.length} />`;

    let buttons = [
        {
            class: 'btn-warning ' + (props.process.running ? '' : 'disabled'),
            click: props.onPause,
            icon: 'pause'
        },
        {
            class: 'btn-info ' + (props.process.running ? 'disabled' : ''),
            click: props.onStepFW,
            icon: 'step-forward'
        },
        {
            class: 'btn-info ' + (props.process.running ? 'disabled' : ''),
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
        <div class="row">
            <div class="col">
                ${queue}
            </div>
        </div>
    `
}

export default EditorActions;