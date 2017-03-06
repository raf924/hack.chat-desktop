///<reference path="../messageData.ts"/>
import {Channel} from "../channel";

class HackChat extends Channel {
    service = "hack.chat";
    static service = "hack.chat";
    url: string = "wss://hack.chat/chat-ws";
    protected ws: WebSocket;
    protected online: boolean;

    info(args: MessageData) {
    };

    warn(args: MessageData) {
    };

    onlineRemove(args: MessageData) {
        this.removeUser(args.nick);
    };

    onlineSet(args: MessageData) {
        this.online = true;
        for (let nick of args.nicks) {
            if (!this.users[nick]) {
                this.users[nick] = "";
                this.addUser(nick);
            }
        }
    };

    onlineAdd(args: MessageData) {
        this.addUser(args.nick);
    };

    chat(args: MessageData) {
        this.lastSender = this.lastSender === null ? "" : this.currentSender;
        this.currentSender = args.nick;
        this.setTripCode(args.nick, args.trip);
    }

    public get isOnline(): boolean {
        return this.online;
    }

    constructor(name, nickName, password) {
        super(name, nickName, password);

    }

    connect(){
        this.ws = new WebSocket(this.url);
        this.ws.onopen = this.onConnectionOpen.bind(this);
        this.ws.onclose = this.onConnectionClose.bind(this);
        this.ws.onmessage = this.onDataReceived.bind(this);
    }

    onConnectionOpen(data: any) {
        window.setInterval((function () {
            this.send({
                cmd: 'ping'
            });
        }).bind(this), 30000);
        this.send({
            cmd: "join",
            channel: this.name,
            nick: `${this.nick}#${this.password}`
        });
    }

    onConnectionClose(data: CloseEvent) {
        this.disconnect(data.code, data.reason);
    }

    onDataReceived(data: MessageEvent) {
        let args: MessageData = JSON.parse(data.data);
        if (args.cmd !== "chat") {
            this.currentSender = "";
        }
        if (typeof this[args.cmd] === "function") {
            this[args.cmd](args);
        } else {
            throw "Unknown command";
        }
        this.receiveMessage(args);
    }

    send(args: MessageData) {
        if (this.ws && this.ws.readyState == this.ws.OPEN) {
            this.ws.send(JSON.stringify(args));
        }
    }

    sendMessage(message) {
        this.send({
            cmd: "chat",
            text: message
        });
    }

    close() {
        this.ws.close();
    }
}

let service = HackChat;
export {HackChat, service};
