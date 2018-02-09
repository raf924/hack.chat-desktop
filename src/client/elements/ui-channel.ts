import {Channel} from "../channel";
import {App} from "../app";
import {ChannelEventListener} from "../channelEventListener";
import {UI} from "../ui";
import {Autocomplete} from "../autocomplete";
import {ChannelTabs} from "./ui-channel-tabs";

export class ChannelUI extends ChannelEventListener {
    public messagesUI: HTMLElement;
    public channel: Channel;
    public accessLink: HTMLElement;
    public ui: HTMLElement;
    public messageCounter: HTMLElement;
    public unreadMessageCount: number;
    public isAtBottom: boolean = true;

    public getChannel(): Channel {
        return this.channel;
    }

    static get is() {
        return "ui-channel";
    }

    static get properties() {
        return {
            channel: {
                type: Channel,
                readOnly: true,
                notify: true
            },
            messages: {
                type: Array,
                notify: true,
                value() {
                    return [];
                }
            }, active: {
                type: Boolean,
                notify: true,
                computed: "_isActive(channel)"
            }
        };
    }

    ready() {
        super.ready();
        this.createAccessLink();
        this.unreadMessageCount = 0;
        this.ui = <HTMLElement>document.querySelector("#channels").lastChild;
        this.ui.id = this.channel.channelId;
        this.messagesUI = this.ui;
        this.bindChannelEvents();
        this.bindUIEvents();
        this.appendMessage({cmd: "info", text: "Waiting for connection..."});
    }

    constructor() {
        super();
    }

    public _isActive(channel: Channel) {
        return channel.active;
    }

    public disconnected(event): void {
        if (event.code !== 1000) {
            let reconnectTimeout = window.setTimeout((function () {
                document.dispatchEvent(new CustomEvent("newChannel", {
                    detail: {
                        service: this.channel.service,
                        name: this.channel.name,
                        nick: this.channel.nick,
                        password: this.channel.password,
                        reconnect: true
                    }
                }));
                this.bindChannelEvents();
            }).bind(this), UI.DEFAULT_ALERT_TIMEOUT);
            document.dispatchEvent(new CustomEvent("disconnect", {
                detail: {
                    channel: this.channel,
                    reason: event.reason,
                    reconnectTimeout
                }
            }));
        } else {
            document.dispatchEvent(new CustomEvent("close", {
                detail: {
                    channel: this.channel
                }
            }));
        }
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
                UI.load().insertAtCursor(`@${target.innerText} `);
            }
        }).bind(this));
    }

    public appendMessage(args: any) {
        let messageElement: UIMessage = <UIMessage> document.createElement("ui-message");
        let wasAtBottom = Math.floor(this.messagesUI.scrollHeight - this.messagesUI.scrollTop) <= this.messagesUI.clientHeight + 1;
        this.messagesUI.appendChild(messageElement);
        //tmpElement.outerHTML = UI.views.message.element;
        //let messageElement = <HTMLElement>this.messagesUI.lastChild;
        if (args.nick === this.channel.nick) {
            messageElement.classList.add("from-user");
        }
        switch (args.cmd) {
            case "chat":
                if (args.nick === this.channel.lastSender) {
                    messageElement.classList.add("from-last-sender");
                }
                //messageElement.querySelector(".nick").setAttribute("data-nick", args.nick);
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
            messageElement.classList.add("cmd");
            //args.nick = args.text;
            //messageElement.parentElement.classList.add("hidden");
            //messageElement.querySelector(".timestamp").classList.remove("hidden");
        }
        messageElement.message = args;
        /*        messageElement.querySelector(".nick").innerHTML = args.nick;
                messageElement.querySelector(".text").innerHTML = args.text;
                messageElement.querySelector(".trip").innerHTML = args.trip;*/
        /*if (args.time) {
            messageElement.querySelector(".timestamp").textContent = new Date(args.time).toLocaleString();
        }
        if (args.mod) {
            //messageElement.querySelector(".mod").classList.remove("hidden");
        }*/
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
        if (App.isElectron && App.load().currentChannel_ === this.channel.channelId) {
            (<Autocomplete>UI.load().chatBox).addItem(user);
        }
    }

    tripCodeSet(user, tripCode) {

    }

    removeUser(user) {
        if (App.isElectron && App.load().currentChannel_ === this.channel.channelId) {
            (<Autocomplete>UI.load().chatBox).removeItem(user);
        }

    }

    messageReceived(args) {
        let notificationText = "";
        switch (args.cmd) {
            case "onlineSet":
                args.text = `Users online : ${args.nicks.join(", ")}`;
                UI.load().chatInputForm.parentElement.removeAttribute("hidden");
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
                let message = App.load().parseText(args.text);
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
        let isCurrentChannel = this.channel.channelId === App.load().currentChannel_;
        let shouldNotify = UI.load().notifyConfig[args.cmd];
        let isAppActive = !(!document.hasFocus() || !App.isElectron && window.cordova.plugins.backgroundMode.isActive());
        let isUserMentionned = args.mention;
        if (!isCurrentChannel || !isAppActive) {
            this.unreadMessageCount++;
            //this.messageCounter.innerText = `${this.unreadMessageCount}`;
            if (shouldNotify || isUserMentionned) {
                let notificationTitle = `Chatron - ${this.channel.name}@${this.channel.service}`;
                let notificationClicked = (function () {
                    UI.load().channelTabs.activateTab(this.channel.channelId);
                }).bind(this);
                if (!App.isElectron) {
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
            //this.unreadMessageCount = 0;
            //this.messageCounter.innerText = `${this.unreadMessageCount}`;
        }
    }

    private createAccessLink() {
        //TODO: replace this with an event to the App component
        (<ChannelTabs>UI.load().channelTabs.tabContainer).addChannel(this.channel);
        /*        let tmpElement = document.createElement("div");
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
                */
    }
}