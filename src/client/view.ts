import {App} from "./app";
const fs = require('fs');
class View {
    element: string;

    constructor(name) {
        try{
            if (!App.isCordova) {
                this.element = fs.readFileSync(`${__dirname}/../../static/views/${name}.html`).toString();
            } else {
                this.element = require(`html-loader!../../static/views/${name}.html`);
            }
        } catch (e){
            this.element = `<div class="${name}"></div>`;
        }
    }
}
export {View};