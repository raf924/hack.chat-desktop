import {App} from "./app";
const fs = require('fs');
class View {
    element: string;

    constructor(name) {
        try{
            if (!App.isCordova) {
                this.element = fs.readFileSync(`${__dirname}/../../static/views/${name}.html`).toString();
            } else {
                this.element = $.ajax(`static/views/${name}.html`, {async: false}).responseText;
            }
        } catch (e){
            this.element = `<div class="${name}"></div>`;
        }
    }
}
export {View};