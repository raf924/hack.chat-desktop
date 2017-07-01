///<reference path="messageData.ts"/>
///<reference path="../types/cordova.d.ts"/>
import {Channel} from "./channel";
import {App} from "./app";
import {ChannelEventListener} from "./channelEventListener";
import {UI} from "./ui";
import {Autocomplete} from "./autocomplete";

export class ChannelUI extends ChannelEventListener {
    public messagesUI: HTMLElement;
    public readonly channel: Channel;
    public accessLink: HTMLElement;
    public ui: HTMLElement;
    public messageCounter: HTMLElement;
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
        let tmpElement = document.createElement("div");
        document.querySelector("#channels").appendChild(tmpElement);
        tmpElement.outerHTML = UI.views.channel.element;
        this.ui = <HTMLElement>document.querySelector("#channels").lastChild;
        this.ui.id = this.channel.channelId;
        this.messagesUI = this.ui;
        this.bindChannelEvents();
        this.bindUIEvents();
        this.appendMessage({cmd: "info", text: "Waiting for connection..."});
    }

    public disconnected(event): void {
        if (event.code !== 1000) {
            let reconnectTimeout = window.setTimeout((function () {
                let currentChannel = App.currentChannel_;
                this.channel = App.openChannel(this.channel.service, this.channel.name, this.channel.nick, this.channel.password);
                App.currentChannel = currentChannel;
                this.bindChannelEvents();
            }).bind(this), UI.DEFAULT_ALERT_TIMEOUT);
            UI.alert(`${this.channel.name}@${this.channel.service} was disconnected\nReason: ${event.reason}\nRetrying`, UI.DEFAULT_ALERT_TIMEOUT, "Cancel", (function () {
                window.clearTimeout(reconnectTimeout);
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
        let oldHeight = 0;
        this.messagesUI.addEventListener("scroll", (function () {
            this.isAtBottom = Math.floor(this.messagesUI.scrollHeight - this.messagesUI.scrollTop) <= this.messagesUI.clientHeight + 1;
        }).bind(this));
        this.messagesUI.addEventListener("wheel", function (e) {
            oldHeight = (<HTMLElement>e.currentTarget).scrollHeight;
        });
        this.messagesUI.addEventListener("tap", (function (e) {
            let target = <HTMLElement>e.target;
            if (target.classList.contains("text")) {
                let parentElement = target.parentElement;
                while (!parentElement.matches(".message")) {
                    parentElement = parentElement.parentElement;
                }
                parentElement.querySelector(".timestamp").classList.toggle("hidden");
                if (this.isAtBottom) {
                    this.scrollToBottom();
                }
            } else if (target.classList.contains("nick")) {
                UI.insertAtCursor(`@${target.innerText} `);
            }
        }).bind(this));
    }

    public appendMessage(args: any) {
        let tmpElement = document.createElement("div");
        let wasAtBottom = Math.floor(this.messagesUI.scrollHeight - this.messagesUI.scrollTop) <= this.messagesUI.clientHeight + 1;
        this.messagesUI.appendChild(tmpElement);
        tmpElement.outerHTML = UI.views.message.element;
        let messageElement = <HTMLElement>this.messagesUI.lastChild;
        if (args.nick === this.channel.nick) {
            messageElement.classList.add("from-user");
        }
        switch (args.cmd) {
            case "chat":
                if (args.nick === this.channel.lastSender) {
                    messageElement.classList.add("from-last-sender");
                }
                messageElement.querySelector(".nick").setAttribute("data-nick", args.nick);
                break;
            case "onlineSet":
                //this.messagesUI.lastElementChild.remove();
                break;
            case "warn":
                if (args.text === "Nickname taken") {
                    this.channel.close();
                    this.channel.disconnect(4000, "Nickname taken");
                }
            case "info":
                break;
            case "onlineAdd":
                break;
            case "onlineRemove":
                break;
            default:
                return;
        }
        if (args.cmd !== "chat") {
            args.nick = args.text;
            messageElement.classList.add("cmd");
            messageElement.parentElement.classList.add("hidden");
            messageElement.querySelector(".timestamp").classList.remove("hidden");
        }
        messageElement.querySelector(".nick").innerHTML = args.nick;
        messageElement.querySelector(".text").innerHTML = args.text;
        messageElement.querySelector(".trip").innerHTML = args.trip;
        if (args.time) {
            messageElement.querySelector(".timestamp").textContent = new Date(args.time).toLocaleString();
        }
        if (args.mod) {
            messageElement.querySelector(".mod").classList.remove("hidden");
        }
        if (wasAtBottom) {
            this.scrollToBottom();
        } else {
            this.isAtBottom = false;
        }
    }

    public scrollToBottom() {
        this.isAtBottom = true;
        this.messagesUI.scrollTop = this.messagesUI.scrollHeight;
    }

    addUser(user) {
        if (!App.isCordova && App.currentChannel_ === this.channel.channelId) {
            (<Autocomplete>UI.chatBox).addItem(user);
        }
    }

    tripCodeSet(user, tripCode) {

    }

    removeUser(user) {
        if (!App.isCordova && App.currentChannel_ === this.channel.channelId) {
            (<Autocomplete>UI.chatBox).removeItem(user);
        }

    }

    messageReceived(args) {
        let notificationText = "";
        switch (args.cmd) {
            case "onlineSet":
                args.text = `Users online : ${args.nicks.join(", ")}`;
                UI.chatInputForm.parentElement.removeAttribute("hidden");
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
        if (args.cmd !== "chat") {
            notificationText = args.text;
        }
        this.appendMessage(args);
        let isCurrentChannel = this.channel.channelId === App.currentChannel_;
        let shouldNotify = UI.notifyConfig[args.cmd];
        let isAppActive = !(!document.hasFocus() || App.isCordova && window.cordova.plugins.backgroundMode.isActive());
        let isUserMentionned = args.mention;
        if (!isCurrentChannel || !isAppActive) {
            this.unreadMessageCount++;
            this.messageCounter.innerText = `${this.unreadMessageCount}`;
            if (shouldNotify || isUserMentionned) {
                let notificationTitle = `Chatron - ${this.channel.name}@${this.channel.service}`;
                let notificationClicked = (function () {
                    UI.channelTabs.activateTab(this.channel.channelId);
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
            this.messageCounter.innerText = `${this.unreadMessageCount}`;
        }
    }

    private createAccessLink() {
        let tmpElement = document.createElement("div");
        UI.channelTabs.tabContainer.appendChild(tmpElement);
        tmpElement.outerHTML = UI.views.accessLink.element;
        this.accessLink = <HTMLElement>UI.channelTabs.tabContainer.lastChild;
        this.accessLink.setAttribute("for", this.channel.channelId);
        this.accessLink.dataset["isFav"] = `${UI.isFavourite(`${this.channel.name}@${this.channel.service}`)}`;
        (<HTMLElement>this.accessLink.querySelector(".ch-close")).dataset["close"] = this.channel.channelId;
        let fav = <HTMLElement>this.accessLink.querySelector(".fav");
        fav.dataset["add"] = `${this.channel.name}@${this.channel.service}`;
        fav.setAttribute("icon", UI.isFavourite(`${this.channel.name}@${this.channel.service}`) ? "star" : "star-border");
        let link = <HTMLElement>this.accessLink.querySelector(".ch-link");
        link.innerText = `${this.channel.name}@${this.channel.service}`;
        link.dataset["tab"] = this.channel.channelId;
        this.messageCounter = <HTMLElement>this.accessLink.querySelector(".counter");
    }
}