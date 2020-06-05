import { h, Component, render,createRef } from 'preact';
import Icon from './Icon.js'
import htm from 'htm';
// Initialize htm with Preact
const html = htm.bind(h);

export default function(props) {
    let options = Object.keys(props.options)
        .map(k => {
            let option = props.options[k]
            return html`
            <li class="list-group-item text-center ${k == props.selected ? 'active' : ''}" role="button"
                onClick=${(e) => props.onClick(k)}>
                    <span class="pr-2 float-left"><${Icon} icon=${option.icon} size='2x' /></span>
                    <span class="align-text-bottom">${option.label}</span>
            </li>`
        })
    return html`<ul class="list-group">${options}</ul>`
}