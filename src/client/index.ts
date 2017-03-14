/*interface Window {
//    $: any
  //  jQuery: any
}

declare const window: Window;
declare const global;
*/
//Necessary for Materialize
//global.$ = global.jQuery = window.$ = window.jQuery = require('jquery');

import {UI} from "./ui";
import {App} from "./app";
App.init();
UI.init();
