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
    constructor(name, nickName){
        super();
        this.users = new Map<string, string>();
        this.name = name;
        this.nick = nickName;
        this.channelId = nickName.split("#")[0] + (nickName.split("#").length > 1 ? "#" : "") + "@" + name;
        var that = this;
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
            if (args.cmd == "onlineAdd") {
                that.users[args.nick] =  "";
                that.addUser(args.nick);
            } else if (args.trip) {
                that.setTripCode(args.nick, args.trip);
            } else if (args.cmd == "onlineRemove") {
                that.removeUser(args.nick);
            } else if (args.nicks) {
                for (var nick of args.nicks) {
                    if (!that.users[nick]) {
                        that.users[nick] = "";
                        that.addUser(nick);
                    }
                }
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
        super.emit("addUser", user);
    }
    removeUser(user){
        super.emit("removeUser", user);
    }
    setTripCode(user, tripCode){
        super.emit("tripCodeSet", user, tripCode);
    }
    receiveMessage(args){
        super.emit("messageReceived", args);
    }
}

export {Channel, MessageData};
