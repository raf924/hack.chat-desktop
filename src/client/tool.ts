export enum ToolType {
    Menu, SubMenu
}

export interface Listener {
    property: string;
    callback: Function;
}

export class Tool extends Polymer.GestureEventListeners(Polymer.Element) {
    public type: ToolType;

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }

    public static get properties(): any {
        return {
            name: {
                type: String,
                observer: "nameChanged"
            }
        }
    }

    public nameChanged(name) {
        this.parentNode.insertBefore(document.createElement(name), this);
        this.remove();
    }

    public static get is() {
        return "ui-tool";
    }

    public get hasListeners(): boolean {
        return false;
    }

    public get listeners(): Array<Listener> {
        return [];
    }
}

customElements.define(Tool.is, Tool);
