const fs = require('fs');
class View {
    element: string;

    constructor(name) {
        this.element = fs.readFileSync(`static/views/${name}.html`).toString();
    }
}
export {View};