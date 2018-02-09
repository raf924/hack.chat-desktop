export class LoginMethod extends Polymer.Element {
    static get is(): string {
        return "login-method";
    };

    open(channel, service) {
        this.channel = channel;
        this.service = service;
    };

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }

    close(): void {
        throw "Must be implemented";
    };

    service: string;
    channel: string;
    ondone: (channelName: string, service: string) => void;
    onfail: (channelName: string, service: string, err: Error) => void;
    oncancel: (channelName: string, service: string) => void;
    onsuccess: (channelName: string, service: string, nick: string, password: string, useAlways: boolean) => void;
}

customElements.define(LoginMethod.is, LoginMethod);