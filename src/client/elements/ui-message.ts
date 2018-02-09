class UIMessage extends Polymer.GestureEventListeners(Polymer.Element) {
    message: MessageData;

    static get is() {
        return "ui-message";
    }

    static get properties() {
        return {
            message: {
                type: Object,
                value: {
                    text: "",
                    cmd: "",
                    nick: "",
                    trip: "",
                    mod: false,
                    time: Date.now()
                },
                readOnly: true,
                notify: true
            }
        };
    }
}

customElements.define(UIMessage.is, UIMessage);