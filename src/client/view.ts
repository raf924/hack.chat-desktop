class View {
    element: string;

    constructor(name) {
        this.element = require(`html-loader!../../static/views/${name}.html`);
    }
}

export {View};