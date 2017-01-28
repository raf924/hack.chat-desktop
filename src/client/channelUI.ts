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
    public isAtBottom: boolean = true;

    public getChannel(): Channel {
        return this.channel;
    }

    constructor(channel: Channel) {
        super();
        this.channel = channel;
        this.createAccessLink();
        this.unreadMessageCount = 0;
        this.usersUI = $(UI.views.users.element).attr("for", this.channel.channelId).appendTo('#users');
        this.ui = $(UI.views.channel.element).attr("id", this.channel.channelId).appendTo("#channels");
        this.messagesUI = this.ui;
        this.bindChannelEvents();
        this.bindUIEvents();
        this.appendMessage({cmd: "info", text: "Waiting for connection..."});
    }

    public disconnected(event): void {
        if (event.code !== 1000) {
            let reconnetTimeout = window.setTimeout((function () {
                this.channel = new Channel(this.channel.name, this.channel.nick, this.channel.password);
                this.bindChannelEvents();
            }).bind(this), UI.DEFAULT_ALERT_TIMEOUT);
            UI.alert(`${this.channel.name}@${this.channel.service} was disconnected\nReason: ${event.reason}\nRetrying`, UI.DEFAULT_ALERT_TIMEOUT, "Cancel", (function () {
                window.clearTimeout(reconnetTimeout);
                UI.closeChannelUI(this.channel.channelId);
            }).bind(this));
        } else {
            UI.closeChannelUI(this.channel.channelId);
        }
    }

    public close() {
        //TODO: ask for confirmation (if config allows it)
        this.channel.close();
        this.accessLink.remove();
        this.usersUI.remove();
        this.messagesUI.remove();
        this.ui.remove();
    }

    private bindChannelEvents() {
        for (let event of ChannelEventListener.events) {
            this.channel.on(event, (function () {
                this[event].apply(this, arguments);
            }).bind(this));
        }
    }

    private bindUIEvents() {
        let that = this;
        let oldHeight = 0;
        this.messagesUI.scroll(function (e) {
            that.isAtBottom = Math.floor(this.scrollHeight - this.scrollTop) <= this.clientHeight + 1;
        });
        this.messagesUI.on("wheel", function (e) {
            oldHeight = this.scrollHeight;
        });
        let hammerTime = new Hammer(this.messagesUI[0]);
        hammerTime.on("tap", (function (e) {
            if (!$(e.target).is(".messages, .cmd *, .nick")) {
                $(e.target).parents(".message").find(".timestamp").toggleClass("hidden");
                if (this.isAtBottom) {
                    this.scrollToBottom();
                }
            }
        }).bind(this));
        this.messagesUI.on("click", ".message .nick[data-nick], .user a.nick", function (e) {
            UI.insertAtCursor(`@${$(this).text()} `);
        });
    }

    public appendMessage(args: MessageData) {
        let $message = $(UI.views.message.element);
        if (args.nick === this.channel.nick) {
            $message.addClass("from-user");
        }
        switch (args.cmd) {
            case "chat":
                if (args.nick === this.channel.lastSender) {
                    $message.addClass("from-last-sender");
                }
                $message.find(".nick").attr("data-nick", args.nick);
                break;
            case "onlineSet":
                this.messagesUI.find(".message").remove();
                break;
        }
        if (args.cmd !== "chat") {
            args.nick = args.text;
            args.text = "";
            $message.addClass("cmd");
            $message.find(".text").parent().css("display", "none");
            $message.find(".timestamp").removeClass("hidden");
        }
        $message.find(".nick").html(args.nick);
        $message.find(".text").html(args.text);
        $message.find(".trip").text(args.trip);
        if (args.time) {
            $message.find(".timestamp").text(new Date(args.time).toLocaleString());
        }
        if (args.mod) {
            $message.find(".mod").removeClass("hidden");
        }
        let wasAtBottom = Math.floor(this.messagesUI[0].scrollHeight - this.messagesUI[0].scrollTop) <= this.messagesUI[0].clientHeight + 1;
        this.messagesUI.append($message);
        if (wasAtBottom) {
            this.scrollToBottom();
        } else {
            this.isAtBottom = false;
        }
    }

    public scrollToBottom() {
        this.isAtBottom = true;
        this.messagesUI.scrollTop(this.messagesUI[0].scrollHeight);
    }

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
                UI.chatInputForm.parent().removeAttr("hidden");
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
                notificationText = `\nFrom ${args.nick}:\n ${notificationText}`;
                break;
        }
        this.appendMessage(args);
        let isCurrentChannel = this.channel.channelId === App.currentChannel;
        let shouldNotify = UI.notifyConfig[args.cmd];
        let isAppActive = !(!document.hasFocus() || App.isCordova && window.cordova.plugins.backgroundMode.isActive());
        let isUserMentionned = args.mention;
        if (!isCurrentChannel || !isAppActive) {
            this.unreadMessageCount++;
            this.messageCounter.text(this.unreadMessageCount);
            if (shouldNotify || isUserMentionned) {
                let notificationTitle = `Chatron - ${this.channel.name}@${this.channel.service}`;
                let notificationClicked = (function () {
                    UI.channelTabs.tabs("activate", this.channel.channelId);
                }).bind(this);
                if (App.isCordova) {
                    window.cordova.plugins.notification.local.schedule({
                        title: notificationTitle,
                        text: notificationText,
                    });
                    window.cordova.plugins.notification.local.on("click", notificationClicked);
                } else {
                    let notification = new Notification(notificationTitle, {
                        body: notificationText
                    });
                    notification.onclick = notificationClicked;
                }
            }
        } else {
            this.unreadMessageCount = 0;
            this.messageCounter.text(this.unreadMessageCount);
        }
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