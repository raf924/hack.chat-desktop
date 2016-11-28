import {Channel} from "./channel";
import {MessageData} from "./channel";
import {MessageIcon, UI} from "./ui";

export abstract class ChannelEventListener {
    protected static events = ["addUser", "removeUser", "tripCodeSet", "messageReceived"];

    abstract addUser(user: string): void

    abstract removeUser(user: string) : void

    abstract tripCodeSet(user: string, trip: string) : void

    abstract messageReceived(args: MessageData) : void
}

export class ChannelUI extends ChannelEventListener {
    public messagesUI: JQuery;
    public usersUI: JQuery;
    public readonly channel: Channel;
    public accessLink: JQuery;
    public ui: JQuery;
    public messageCounter: JQuery;
    public unreadMessageCount: number;

    public getChannel() : Channel {
        return this.channel;
    }

    constructor(channel: Channel) {
        super();
        this.channel = channel;
        this.createAccessLink();
        this.unreadMessageCount = 0;
        $(".users").css("display", "none");
        this.usersUI = $(UI.views.users.element).attr("for", this.channel.channelId).appendTo('#users');
        this.ui = $(UI.views.channel.element).attr("id", this.channel.channelId).appendTo("#channels");
        this.messagesUI = this.ui.find(".messages");
        this.bindEvents();
    }

    public close() {
        //TODO: ask for confirmation (if config allows it)
        this.channel.close();
        this.accessLink.remove();
        this.usersUI.remove();
        this.messagesUI.remove();
        this.ui.remove();
    }

    private bindEvents() {
        let that = this;
        for (let event of ChannelEventListener.events) {
            this.channel.on(event, function () {
                that[event].apply(that, arguments);
            });
        }
    }

    public appendMessage(args: MessageData) {
        let $message = $(UI.views.message.element);
        let message_icon: MessageIcon = UI.message_icons[args.cmd];
        $message.find(".nick").text(args.nick);
        $message.find(".message").html(args.text);
        $message.find(".trip").text(args.trip);
        if (args.mod) {
            $message.find(".mod").removeClass("hide");
        }
        if (message_icon.title) {
            args.nick = "";
        }
        ChannelUI.setMessageIcon($message, message_icon.icon, message_icon.color);
        this.messagesUI.append($message);
        this.scrollToBottom();
    }

    private static setMessageIcon($message: JQuery, icon: string, color: string) {
        $message.addClass("avatar");
        let $icon = $("<i>");
        $icon.addClass("material-icons circle").addClass(color).text(icon);
        $message.prepend($icon);
    }

    private scrollToBottom() {
        this.messagesUI.scrollTop(this.messagesUI[0].scrollHeight);
    }

    /*public loadUsers() {
     this.usersUI.css("display", "");
     this.usersUI.remove(".user");
     let users = this.channel.users;
     for (let user in users) {
     let $user = $(UI.views.user.element);
     $user.find(".nick").text(user);
     $user.find(".trip").text(users[user]);
     $user.attr("user", user);
     this.usersUI.append($user);
     }
     }*/

    addUser(user) {
        let $user = $(UI.views.user.element);
        $user.attr("user", user)
            .find(".nick")
            .text(user);
        this.usersUI.append($user);
        if(UI.currentChannel === this.channel.channelId) {
            UI.chatInputForm.find("#textfield").autocomplete("addItem", user);
        }
    }

    tripCodeSet(user, tripCode) {
        this.usersUI.find(`.user[user='${user}'] .trip`).text(tripCode);
    }

    removeUser(user) {
        this.usersUI.find(`.user[user='${user}']`).remove();
        if(UI.currentChannel === this.channel.channelId){
            UI.chatInputForm.find("#textfield").autocomplete("removeItem", user);
        }

    }

    messageReceived(args) {
        switch (args.cmd) {
            case "onlineSet":
                args.text = `Users online : ${args.nicks.join(", ")}`;
                UI.chatInputForm.find("#textfield").removeAttr('disabled');
                break;
            case "onlineRemove":
                args.text = `${args.nick} has left`;
                break;
            case "onlineAdd":
                args.text = `${args.nick} has joined`;
                break;
            case "chat":
                args.text = UI.parseText(args.text);
                break;
        }
        if (this.channel.channelId !== UI.currentChannel && UI.notifyConfig[args.cmd]) {
            this.unreadMessageCount++;
            this.messageCounter.text(this.unreadMessageCount);
            //TODO: add notifications
        }
        this.appendMessage(args);
    }

    private createAccessLink() {
        this.accessLink = $(UI.views.accessLink.element).attr("for", this.channel.channelId);
        this.accessLink.find(".ch-close").attr("data-close", this.channel.channelId);
        this.accessLink.find(".fav").attr("data-add", this.channel.channelId);
        this.accessLink.find(".ch-link").text(`${this.channel.nick.split("#")[0]}@${this.channel.name}`)
            .attr("data-tab", this.channel.channelId);
        this.messageCounter = this.accessLink.find(".counter");
        $("#channels-tabs").append(this.accessLink);
    }
}