import {Channel} from "./channel";
import {App} from "./app";
import {ChannelEventListener} from "./channelEventListener";
import {UI} from "./ui";

export class ChannelUI extends ChannelEventListener {
    public messagesUI: JQuery;
    public usersUI: JQuery;
    public readonly channel: Channel;
    public accessLink: JQuery;
    public ui: JQuery;
    public messageCounter: JQuery;
    public unreadMessageCount: number;
    public isAtBottom: boolean;

    public getChannel(): Channel {
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
        this.messagesUI = this.ui;
        this.bindEvents();
    }

    public close() {
        //TODO: ask for confirmation (if config allows it)
        this.channel.close();
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
        let oldHeight = 0;
        this.messagesUI.scroll(function (e) {
            let scrollTop = that.messagesUI.scrollTop();
            let scrollHeight = that.messagesUI[0].scrollHeight;
            if (oldHeight === scrollHeight) {
                that.isAtBottom = scrollTop + that.messagesUI.visibleHeight() >= scrollHeight;
            }
        });
        this.messagesUI.on("wheel", function (e) {
            oldHeight = that.messagesUI[0].scrollHeight;
        });
        this.messagesUI.on("click", ".message .text-wrapper", function () {
            $(this).parent().find(".timestamp").toggle(200);
        });
        this.messagesUI.on("click", ".channel .title a, .user a.nick", function (e) {
            UI.insertAtCursor(`@${$(this).text()} `);
        });
    }

    public appendMessage(args: MessageData) {
        let $message = $(UI.views.message.element);
        if (args.nick === this.channel.nick) {
            $message.addClass("from-user");
        }
        if (args.cmd !== "chat") {
            args.nick = args.text;
            args.text = "";
            $message.addClass("cmd");
            $message.find(".text").parent().css("display", "none");
        }
        $message.find(".nick").text(args.nick);
        $message.find(".text").html(args.text);
        $message.find(".trip").text(args.trip);
        $message.find(".timestamp").text(new Date(args.time).toLocaleString());
        if (args.mod) {
            $message.find(".mod").removeClass("hide");
        }
        this.messagesUI.append($message);

        let scrollTop = this.messagesUI.scrollTop();
        let scrollHeight = this.messagesUI[0].scrollHeight;
        let messageHeight = $message.outerHeight();
        if (this.isAtBottom || (scrollTop + this.messagesUI.visibleHeight() >= scrollHeight - messageHeight)) {
            this.scrollToBottom();
        }
    }

    public scrollToBottom() {
        this.isAtBottom = true;
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
        if (App.currentChannel === this.channel.channelId) {
            UI.chatInputForm.find("#chatBox").autocomplete("addItem", user);
        }
    }

    tripCodeSet(user, tripCode) {
        this.usersUI.find(`.user[user='${user}'] .trip`).text(tripCode);
    }

    removeUser(user) {
        this.usersUI.find(`.user[user='${user}']`).remove();
        if (App.currentChannel === this.channel.channelId) {
            UI.chatInputForm.find("#chatBox").autocomplete("removeItem", user);
        }

    }

    messageReceived(args) {
        let notificationText = "";
        switch (args.cmd) {
            case "onlineSet":
                args.text = `Users online : ${args.nicks.join(", ")}`;
                UI.chatInputForm.find("#chatBox").removeAttr("disabled");
                break;
            case "onlineRemove":
                args.text = `${args.nick} has left`;
                break;
            case "onlineAdd":
                args.text = `${args.nick} has joined`;
                break;
            case "info":
                if (args.text.indexOf("invited") === -1) {
                    break;
                }
            case "chat":
                args.text = new Option(args.text).innerHTML;
                let message = App.parseText(args.text);
                args.text = message.text;
                if (message.hasOwnProperty("mention")) {
                    args.mention = message["mention"];
                }
                if (message.hasOwnProperty("originalText")) {
                    notificationText = message["originalText"];
                } else {
                    notificationText = args.text;
                }
                break;
        }
        if (this.channel.channelId !== App.currentChannel && UI.notifyConfig[args.cmd]) {
            this.unreadMessageCount++;
            this.messageCounter.text(this.unreadMessageCount);
            //TODO: add notifications
        }
        if (!document.hasFocus() && args.mention) {
            let notification = new Notification(`Chatron - ${this.channel.name}@${this.channel.service}`, {
                body: `From ${args.nick}:\n ${notificationText}`
            });
            notification.onclick = (function () {
                UI.channelTabs.tabs("activate", this.channel.channelId);
            }).bind(this);
        }
        this.appendMessage(args);
    }

    private createAccessLink() {
        this.accessLink = $(UI.views.accessLink.element).attr("for", this.channel.channelId).attr("data-is-fav", `${UI.isFavourite(`${this.channel.name}@${this.channel.service}`)}`);
        this.accessLink.find(".ch-close").attr("data-close", this.channel.channelId);
        this.accessLink.find(".fav").attr("data-add", `${this.channel.name}@${this.channel.service}`);
        this.accessLink.find(".ch-link").text(`${this.channel.name}@${this.channel.service}`)
            .attr("data-tab", this.channel.channelId);
        this.messageCounter = this.accessLink.find(".counter");
        UI.channelTabs.append(this.accessLink);
    }
}