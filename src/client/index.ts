import {readdir} from "fs";
interface Window {
    $: any
    Hammer: any
    jQuery: any
}

declare const window: Window;
declare const global;

//Necessary for Materialize
global.$ = global.jQuery = window.$ = window.jQuery = require('jquery');
window.Hammer = require('hammerjs');

import {UI} from "./ui";
import fs = require('fs');
import {App} from "./app";

$(document).ready(function () {
    if (fs.hasOwnProperty("readdir")) {
        fs.readdir(`${__dirname}/plugins`, function (err, files) {
            files.forEach(function (file) {
                require(`./plugins/${file}`);
            });
            App.init();
            UI.init();

        });
    } else {
        require('./loadPlugins');
        App.init();
        UI.init();
    }
});
