import {EventEmitter} from 'events';

interface MessageData{
    nick: string,
    trip: string,
    mod: boolean,
    cmd: string,
    nicks : string[],
    text : string
}

class Channel extends EventEmitter{
    name : string;
    nick : string;
    channelId : string;
    users : Map<string, string>;
    ws : WebSocket;
    private online : boolean;
    public get isOnline(): boolean {
        return this.online;
    }
    constructor(name, nickName){
        super();
        this.users = new Map<string, string>();
        this.name = name;
        this.nick = nickName;
        this.online = false;
        this.channelId = nickName.split("#")[0] + (nickName.split("#").length > 1 ? "#" : "") + "@" + name;
        let that = this;
        this.ws = new WebSocket("wss://hack.chat/chat-ws");
        window.setInterval(function () {
            that.send({
                cmd: 'ping'
            });
        }, 50000);
        this.ws.onopen = function () {
            that.send({
                cmd: "join",
                channel: that.name,
                nick: that.nick
            });
        };
        this.ws.onmessage = function (message) {
            let args : MessageData = JSON.parse(message.data);
            switch (args.cmd){
                case "onlineAdd":
                    that.addUser(args.nick);
                    break;
                case "chat":
                    that.setTripCode(args.nick, args.trip);
                    break;
                case "onlineRemove":
                    that.removeUser(args.nick);
                    break;
                case "onlineSet":
                    that.online = true;
                    for (let nick of args.nicks) {
                        if (!that.users[nick]) {
                            that.users[nick] = "";
                            that.addUser(nick);
                        }
                    }
                    break;
                case "warn":
                case "info":
                    break;
                default:
                    throw "Unknown command";
            }
            that.receiveMessage(args);
        };
    }
    send(args){
        if (this.ws && this.ws.readyState == this.ws.OPEN) {
            this.ws.send(JSON.stringify(args));
        }
    }
    sendMessage(message){
        this.send({
            cmd: "chat",
            text: message
        });
    }
    close(){
        this.ws.close();
    }
    addUser(user){
        this.users[user] =  "";
        super.emit("addUser", user);
    }
    removeUser(user){
        delete this.users[user];
        super.emit("removeUser", user);
    }
    setTripCode(user, tripCode){
        this.users[user] = tripCode;
        super.emit("tripCodeSet", user, tripCode);
    }
    receiveMessage(args){
        super.emit("messageReceived", args);
    }
}

export {Channel, MessageData};
