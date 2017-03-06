import {Channel} from "../channel";
class Dummy extends Channel {
    static service = "dummy";
    service = Dummy.service;

    constructor(name, nick, password) {
        super(name, nick, password);
    }

    connect() {
    }

    get isOnline(): boolean {
        return true;
    }

    send(args) {
        args.nick = this.nick;
        this.onDataReceived(args);
    }

    sendMessage(message) {
        this.send({cmd: "chat", text: message});
    }

    close() {
    }

    onConnectionOpen(data: any) {
        this.onDataReceived({cmd: "onlineSet", nicks: [this.nick]});
    }

    onConnectionClose(data: any) {
    }

    onDataReceived(data: MessageData) {
        this.lastSender = this.lastSender === null ? "" : this.currentSender;
        this.currentSender = data.nick;
        this.receiveMessage(data);
    }

}
let service = Dummy;
export {Dummy, service};