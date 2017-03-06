import {ToastyChat} from "./toasty.chat";
class BouncerToastyChat extends ToastyChat {
    service: string = "bouncer/ToastyChat";
    static service: string = "bouncer/ToastyChat";
    url: string = "wss://toasty.rafaelnaciri.tk/chatws";

    constructor(name, nick, password) {
        super(name, nick, password);
    }
}

let service = BouncerToastyChat;
export {service, BouncerToastyChat};