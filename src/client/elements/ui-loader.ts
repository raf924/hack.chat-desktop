class Loader extends Polymer.Element {
    static get is() {
        return "ui-loader";
    }

    static get properties() {
        return {
            active: {
                type: Boolean,
                value: false,
                reflectToAttribute: true
            }
        };
    }

    constructor() {
        super();
    }
}

customElements.define(Loader.is, Loader);