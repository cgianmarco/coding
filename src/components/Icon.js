import { h, Component, render,createRef } from 'preact';
import htm from 'htm';
// Initialize htm with Preact
const html = htm.bind(h);

function Icon(props) {
    return html`<i class="fas fa-${props.icon} ${props.size ? 'fa-' + props.size : ''}"></i>`
}

export default Icon;