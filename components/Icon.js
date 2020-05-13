import { h, Component, render,createRef } from 'https://unpkg.com/preact?module';
import htm from 'https://unpkg.com/htm?module';
// Initialize htm with Preact
const html = htm.bind(h);

function Icon(props) {
    return html`<i class="fas fa-${props.icon} ${props.size ? 'fa-' + props.size : ''}"></i>`
}

export default Icon;