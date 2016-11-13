interface Window {
    $: any
    Hammer: any
    jQuery: any
}

declare const window: Window;

//Necessary for Materialize
window.$ = window.jQuery = require('jquery');
window.Hammer = require('hammerjs');

import {UI} from "./ui";
import fs = require('fs');

$(document).ready(function () {
    fs.readdir(`${__dirname}/plugins`, function (err, files) {
        files.forEach(function (file) {
            require(`./plugins/${file}`);
        });
        UI.init();
    });
});
