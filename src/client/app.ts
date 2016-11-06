interface Window{
    $: any
    Hammer: any
    jQuery : any
}

declare const window: Window;

window.$ = window.jQuery = require('jquery');
window.Hammer = require('hammerjs');

import {UI} from "./ui";

$(document).ready(function () {
    require('./plugins/tabs');
    require('./plugins/visibleHeight');
    UI.init();
});
