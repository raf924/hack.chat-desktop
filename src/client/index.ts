interface Window {
    $: any
    Hammer: any
    jQuery: any
}

declare const window: Window;
declare const global;

//Necessary for Materialize
global.$ = global.jQuery = window.$ = window.jQuery = require('jquery');
require("../../static/js/bootstrap.min");
window.Hammer = require('hammerjs');

import {UI} from "./ui";
import fs = require('fs');
import {App} from "./app";

$(document).ready(function () {
    App.init();
    if (!App.isCordova) {
        fs.readdir(`${__dirname}/plugins`, function (err, files) {
            files.forEach(function (file) {
                require(`./plugins/${file}`);
            });
            UI.init();

        });
    } else {
        require('./loadPlugins');
        UI.init();
    }
});
