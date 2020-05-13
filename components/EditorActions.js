import { h, Component, render,createRef } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
import Icon from './Icon.js'
// Initialize htm with Preact
const html = htm.bind(h);

function CommandsQueue(props) {
    return html`
        <div class="col pt-3 alert alert-info">
            <${Icon} icon="stopwatch" /> <span>actions to complete</span> <span class="badge badge-pill badge-info">${props.queue}</span>
        </div>
    `
}

function EditorActions(props) {
    let queue = html`<${CommandsQueue} queue=${props.process.agent.commands.length} />`;

    let buttons = [
        {
            class: 'btn-danger ' + (props.process.running ? 'disabled' : ''),
            click: props.onReset,
            icon: 'broom',
            text: 'Clean'
        },
        {
            class: 'btn-warning ' + (props.process.running ? '' : 'disabled'),
            click: props.onPause,
            icon: 'pause',
            text: 'Pause'
        },
        {
            class: 'btn-info ' + (props.process.running ? 'disabled' : ''),
            click: props.onStepFW,
            icon: 'step-forward',
            text: 'Step'
        },
        {
            class: 'btn-info ' + (props.process.running ? 'disabled' : ''),
            click: props.onRun,
            icon: 'play',
            text: 'Run'
        }
    ]
    .map((b, i) => html`
        <button class="btn col mr-1 btn ${b.class}" onClick=${b.click}>
<div><${Icon} icon=${b.icon} /></div><div>${b.text}</div>
        </button>
    `)
    return html`
        <div class="row">
            ${queue}
        </div>
        <div class="row mt-1">
            ${buttons}
        </div>
    `
}

export default EditorActions;