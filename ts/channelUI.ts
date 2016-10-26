import {Channel} from "./channel";
import {MessageData} from "./channel";
import {MessageIcon, UI} from "./ui";
const View = require("../static/js/views").View;

let views: {message: string; user: string; users: string; channel: string};

export class ChannelEventListener {
    addUser: Function;
    removeUser: Function;
    tripCodeSet: Function;
    messageReceived: Function;
}

class ChannelUI implements ChannelEventListener {
    private messagesUI: JQuery;
    private usersUI: JQuery;
    private channel: Channel;
    private accessLink: JQuery;
    private ui: JQuery;
    private messageCounter: JQuery;

    constructor(channel: Channel) {
        this.channel = channel;
        this.accessLink = $("<li>").addClass("tab row");
        let $close_link = $("<a href='#!'>").attr("data-close", channel.channelId).addClass("col s1 ch-close waves-effect waves-teal");
        let $close_link_icon = $("<i class='material-icons'>").text("close");
        let $fav_link = $("<a href='#!'>").attr("data-add", channel.channelId).addClass("col s1 fav waves-effect waves-teal");
        let $fav_link_icon = $("<i class='material-icons'>").text("grade");
        $fav_link.append($fav_link_icon);
        $close_link.append($close_link_icon);
        let $link = $("<a href='#!'>").addClass("active ch-link col s8").text(channel.channelId.replace("#", ""));
        $link.attr("data-tab", channel.channelId);
        let $badge = $("<a>").addClass("col counter badge s1").text(0);
        this.messageCounter = $badge;
        this.accessLink.append($fav_link)
            .append($link)
            .append($badge)
            .append($close_link)
            .attr("for", channel.channelId);
        $("#channels-tabs").append(this.accessLink);
        $("form#send #textfield").removeAttr("disabled");

        this.ui = $(UI.views[channel.channelId]);
        this.ui.attr("id", channel.channelId);
        this.ui.appendTo("#channels");

        $(".users").css("display", "none");
        this.usersUI = $(UI.views["users"]).attr("for", channel.channelId);
        $("#users").append(this.usersUI);
        //$(`#users`).find(`.users[for='${this.channel.channelId}']`);
        this.messagesUI = $("#channels").find(`.channel[id='${this.channel.channelId}']`);
        //$(`[id='${this.channel.channelId}']`);
        this.bindEvents();
    }

    public close() {
        this.channel.close();
        this.accessLink.remove();
        this.usersUI.remove();
        this.messagesUI.remove();
        this.ui.remove();
    }

    private bindEvents() {
        let that = this;
        for (var event in ChannelEventListener) {
            if (ChannelEventListener.hasOwnProperty(event)) {
                this.channel.on(event, function () {
                    that[event].apply(this, arguments);
                });
            }
        }
    }

    public appendMessage(args: MessageData) {
        var $message = $(views["message"]);
        var message_icon: MessageIcon = UI.message_icons[args.cmd];
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
        var $icon = $("<i>");
        $icon.addClass("material-icons circle").addClass(color).text(icon);
        $message.prepend($icon);
    }

    private scrollToBottom() {
        this.messagesUI.scrollTop(this.messagesUI[0].scrollHeight);
    }

    public loadUsers() {
        //TODO: load users
        this.usersUI.css("display", "");
        let users = this.channel.users;
        for (var user in users) {
            var $user = $(views["user"]);
            $user.find(".nick").text(user);
            $user.find(".trip").text(users[user]);
            $user.attr("user", user);
            this.usersUI.append($user);
        }
    }

    addUser(user) {
        var $user = $(UI.views["user"]);
        $user.attr("user", user).find(".nick").text(user);
        this.usersUI.append($user);
    }

    tripCodeSet(user, tripCode) {
        this.usersUI.find(`.user[user='${user}'] .trip`).text(tripCode);
    }

    removeUser(user) {
        this.usersUI.find(`.user[user='${user}']`).remove();
    }

    messageReceived(args) {
        switch (args.cmd) {
            case "onlineSet":
                args.text = `Users online : ${args.nicks.join(", ")}`;
                this.loadUsers();
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
            let count = Number(this.messageCounter.text());
            count++;
            this.messageCounter.text(count);
            //TODO: add notifications
        }
        this.appendMessage(args);
    }
}

export {ChannelUI};