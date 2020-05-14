import { h, Component, render,createRef } from 'preact';
import htm from 'htm';
import 'bootstrap/dist/css/bootstrap.min.css';
import './stylesheets/style.css'
import '@fortawesome/fontawesome-free/css/fontawesome.css'
import '@fortawesome/fontawesome-free/css/solid.css'
import Workspace from './Workspace.js'

// Initialize htm with Preact
const html = htm.bind(h);

function Application() {
    return html`
        <div class="container-fluid">
            <div class="row">
                <div class="col">
                    <h1>Coding <i class="fas fa-code"></i></h1>
                </div>
            </div>
            <${Workspace} />
        </div>
    `
}
render(html`<${Application} />`, document.body);