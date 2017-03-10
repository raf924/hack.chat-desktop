interface Window {
    $: any
    jQuery: any
}

declare const window: Window;
declare const global;

//Necessary for Materialize
global.$ = global.jQuery = window.$ = window.jQuery = require('jquery');

import {UI} from "./ui";
import fs = require('fs');
import {App} from "./app";

document.addEventListener("DOMContentLoaded", function () {
    App.init();
    if (!App.isCordova) {
        fs.readdir(`${__dirname}/modules/plugins`, function (err, files) {
            files.forEach(function (file) {
                require(`${__dirname}/modules/plugins/${file}`);
            });
            UI.init();
        });
    } else {
        let r = require.context(`${__dirname}/modules/plugins`, false, /\.js$/);
        r.keys().forEach(r);
        UI.init();
    }
});
