class CollapseItem extends Polymer.Element {
    opened: boolean;
    icon: string;
    openIcon: string;
    closeIcon: string;
    private uiCollapse: Collapse;

    static get properties() {
        return {
            openIcon: {
                type: String,
                value: "expand-less"
            },
            closeIcon: {
                type: String,
                value: "expand-more"
            },
            icon: {
                type: String,
                value: "expand-more",
                computed: "_icon(openIcon, closeIcon, opened)"
            },
            opened: {
                type: Boolean,
                value: false
            }
        };
    }

    static get is() {
        return "ui-collapse-item";
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
        this.uiCollapse = <Collapse>this.shadowRoot.querySelector("iron-collapse");
        let slot: HTMLSlotElement = <HTMLSlotElement>document.createElement("slot");
        slot.name = "collapsible";
        this.uiCollapse.shadowRoot.appendChild(slot);
        this.$.header.addEventListener("click", function (e) {
            this.toggle();
        });

        function passThrough(e) {
            this.dispatchEvent(new CustomEvent(event.type));
        }

        this.uiCollapse.addEventListener("opened", passThrough.bind(this));
        this.uiCollapse.addEventListener("closed", passThrough.bind(this));
    }

    _icon() {
        return this.uiCollapse ? (this.opened ? this.openIcon : this.closeIcon) : "expand-more";
    }

    toggle() {
        this.uiCollapse.toggle();
        this.opened = this.uiCollapse.opened;
    }
}

customElements.define(CollapseItem.is, CollapseItem);
