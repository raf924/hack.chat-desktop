///<reference path="../../types/Polymer.d.ts"/>

class Collapse extends Polymer.Element {
    private ironCollapse: PolymerElement;

    static get is() {
        return "ui-collapse";
    }

    constructor() {
        super();
        let that = this;
    }

    ready() {
        this.ironCollapse = <PolymerElement>this.root.querySelector("iron-collapse");
        this.ironCollapse.addEventListener("transitionend", function (e) {
            this.dispatchEvent(new CustomEvent(this.opened ? "opened" : "closed", {
                bubbles: true
            }));
        });
        this.loadContent();
        let observer = new MutationObserver(function (mutations) {
            this.loadContent();
        }.bind(this));
        observer.observe(this, {childList: true, subtree: true, attributes: true, characterData: true});
        this.loadContent();
    }

    get opened() {
        return this.ironCollapse.opened;
    }

    loadContent() {
        this.ironCollapse.root.querySelector("content").innerHTML = this.innerHTML;
    }

    toggle() {
        this.ironCollapse.toggle();
    }
}

customElements.define(Collapse.is, Collapse);