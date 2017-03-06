import {HackChat} from "./hack.chat";

interface ToastyMessageData extends MessageData{
    valid?: boolean;
    mSet?: boolean;
    bSet?: boolean;
    version?: string;
    pass?: string;
}

class ToastyChat extends HackChat {
    service = "ToastyChat";
    static service = "ToastyChat";
    url = "wss://chat.toastystoemp.com/chatws";

    constructor(name, nick, password) {
        super(name, nick, password);
    }
    send(args: ToastyMessageData) {
        super.send(args);
    }
    onConnectionOpen(data) {
        window.setInterval((function () {
            this.send({
                cmd: 'ping'
            });
        }).bind(this), 30000);
        this.send({
            cmd: "verify",
            version: "201612290029"
        });
    }
    verify(args : ToastyMessageData) {
        if (!args.valid) {
            this.receiveMessage({
                cmd: "warn",
                text: "The client is not up to date. Features might be missing or not working."
            });
        }
        this.send({
            cmd: "join",
            channel: this.name,
            nick: this.nick,
            pass: this.password
        });
    }
    dataSet(args: ToastyMessageData) {
    }

    pong(args: ToastyMessageData){

    }
}
let service = ToastyChat;
export {ToastyChat, service};