import {EventEmitter} from 'events';

abstract class Channel extends EventEmitter {
    name: string;
    nick: string;
    users: Map<string, string>;
    password: string;
    service;
    lastSender: string = null;
    currentSender: string;

    constructor(name, nickName, password) {
        super();
        this.users = new Map<string, string>();
        this.name = name;
        this.nick = nickName;
        this.password = password;
    }

    public get channelId() : string {
        return `${this.nick}@${this.name}@${this.service}`;
    }

    abstract get isOnline(): boolean;

    abstract send(args);

    abstract sendMessage(message);

    abstract close();

    abstract onConnectionOpen(data: any);

    abstract onConnectionClose(data: any);

    abstract onDataReceived(data: any);

    abstract connect();

    addUser(user) {
        this.users[user] = "";
        super.emit("addUser", user);
    }

    removeUser(user) {
        delete this.users[user];
        super.emit("removeUser", user);
    }

    setTripCode(user, tripCode) {
        this.users[user] = tripCode;
        super.emit("tripCodeSet", user, tripCode);
    }

    receiveMessage(args) {
        super.emit("messageReceived", args);
    }

    disconnect(code: number, reason: string) {
        super.emit("disconnected", {code, reason});
    }
}

export {Channel};
