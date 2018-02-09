class UIToolBar extends Polymer.Element {
    static get is() {
        return "ui-toolbar";
    }

    constructor() {
        super();
    }

    static get properties() {
        return {
            tools: {
                type: Array,
                value() {
                    return [];
                }
            }
        }
    }

    ready() {
        super.ready();
    }
}

customElements.define(UIToolBar.is, UIToolBar);