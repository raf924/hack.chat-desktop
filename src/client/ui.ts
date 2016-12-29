///<reference path="../../node_modules/@types/jquery/index.d.ts" />
///<reference path="plugins/index.d.ts"/>
///<reference path="../../node_modules/@types/materialize-css/index.d.ts"/>

//TODO: add keyboard shortcuts

import {ChannelUI} from "./channelUI"
const titlebar = require('titlebar');
import fs = require('fs');
import {View} from "./view";
import {Channel} from "./channel";
import {App} from "./app";

export interface MessageIcon {
    icon: string,
    color: string,
    title: boolean
}

export class Views {
    message: View;
    channel: View;
    user: View;
    users: View;
    accessLink: View;

    constructor() {
        this.message = new View("message");
        this.channel = new View("channel");
        this.users = new View("users");
        this.user = new View("user");
        this.accessLink = new View("accessLink");
    }
}

interface Titlebar {
    appendTo(el: HTMLElement): Titlebar;
    element: HTMLElement;
    destroy(): void;
    on(event: string, callback: Function): Titlebar;
}

export interface NotifyConfig {
    onlineSet: boolean,
    onlineAdd: boolean,
    onlineRemove: boolean,
    chat: boolean,
    warn: boolean
}

//TODO: subclass UI to allow custom interfaces (remove titlebar from parent class ?)
class UI {
    static message_icons: MessageIcon;
    private static favouritesUI: JQuery;
    private static titleBar: Titlebar;
    private static channelUIs: Map<string, ChannelUI>;
    public static notifyConfig: NotifyConfig;
    public static views: Views;
    private static nickPrompt: JQuery;
    public static chatInputForm: JQuery;
    public static channelTabs: JQuery;

    public static getCurrentChannelUI(): ChannelUI {
        return UI.channelUIs[App.currentChannel];
    }

    private static addFavourite(channelName: string) {
        App.favourites.push(channelName);
        let $favouriteLink = $("<a>").attr("href", "#").attr("data-open", channelName).text(channelName);
        let $favourite = $("<li>").append($favouriteLink);
        UI.favouritesUI.append($favourite);
        let visibleHeight: Number = UI.favouritesUI.visibleHeight();
        if (UI.favouritesUI.css("max-height") != visibleHeight.toString() && UI.favouritesUI.height() > visibleHeight) {
            UI.favouritesUI.css("max-height", visibleHeight.toString());
        }
    }

    public static init() {
        //TODO: See hammer.js for swipe (already imported for materialize-css)

        UI.channelUIs = new Map<string, ChannelUI>();
        //TODO: Load UI components from component/selector maps stored in JSON
        UI.channelTabs = $("#channels-tabs");
        UI.loadViews();
        UI.nickPrompt = $("#nickPrompt");
        UI.chatInputForm = $("form#send");
        UI.nickPrompt.modal();
        UI.notifyConfig = {
            "onlineSet": false,
            "onlineAdd": true,
            "onlineRemove": true,
            "chat": true,
            "warn": true
        }; //TODO: get the notify values from the App.userData

        UI.favouritesUI = $("#favourites");
        UI.favouritesUI.on("click", "li a[data-open]", function (e) {
            UI.login($(this).attr("data-open"));
        });
        App.userData.get("favourites", function (favourites) {
            favourites.forEach(function (favourite) {
                UI.addFavourite(favourite);
            });
        });
        if (!App.isCordova) {
            UI.message_icons = require(`${__dirname}/../../static/data/message_icons.json`);
        } else {
            UI.message_icons = JSON.parse($.ajax("static/data/message_icons.json", {async: false}).responseText);
        }

        if (!App.isCordova) {
            UI.loadIpcEvents();
            UI.titleBar = titlebar();
            UI.titleBar.appendTo(document.body);
            $(UI.titleBar.element).append($("<div>").text("Chatron"));
            UI.loadTitleBarEvents();
        }
        UI.loadUIEvents();
        UI.loadChatEvents();
        UI.loadLoginEvents();
        UI.loadTabEvents();
        UI.loadChannelEvents();

    }

    private static loadTitleBarEvents(): void {
        for (let event of ["close", "minimize", "fullscreen"]) {
            UI.titleBar.on(event, function (e) {
                App.ipc.send(event, function () {

                });
            });
        }
    }

    private static loadViews(): void {
        UI.views = new Views();
    }

    private static insertAtCursor(text): void {
        let textfield: HTMLTextAreaElement = <HTMLTextAreaElement>UI.chatInputForm.find("#textfield")[0];
        let pos = textfield.selectionStart || 0;
        let value = textfield.value;
        textfield.value = [value.slice(0, pos), text, value.slice(pos)].join('');
        textfield.selectionStart = pos + text.length;
        textfield.focus();
    }

    private static loadChatEvents(): void {
        UI.chatInputForm.submit(function (e) {
            e.preventDefault();
        }).find("#textfield").keydown(function (e) {
            if (e.keyCode === 13 && !e.shiftKey) {
                e.preventDefault();
                UI.channelUIs[App.currentChannel].channel.sendMessage($(this).val());
                $(this).val("");
            }
            //TODO: add commands handling
            //TODO: add history
        }).autocomplete();
    }

    private static loadLoginEvents(): void {
        UI.nickPrompt.find("form")[0].onsubmit = function (e) {
            e.preventDefault();
            let $nick = $(e.target).find("input.validate");
            let nick = $nick.data("realNick");
            if (!App.isCordova) {
                App.ipc.send("join", JSON.stringify({"channel": $nick.data("channel"), "nick": nick}));
            } else {
                UI.login($nick.data("channel"), nick);
            }
            $nick.val("").data("realNick", "").data("channel", "");
            let forAll = $(e.target).find("#forAll:checked");
            if (forAll.length > 0) {
                App.userData.set("nickName", nick);
                App.nick = nick;
            }
            UI.nickPrompt.modal('close');
            if (document.body.clientWidth < 992) {
                $(".button-collapse").sideNav("hide");
            }
        };
        UI.nickPrompt.find("form input.validate").mixedLogin();
    }

    private static loadUIEvents(): void {
        $("#menu").on("click", "a.fav", function (e) {
            e.preventDefault();
            UI.addFavourite($(this).attr("data-add"));
            App.userData.set("favourites", App.favourites);
        });
        $("body").on("click", ".channel .title a, .user a.nick", function (e) {
            UI.insertAtCursor(`@${$(this).text()} `);
        });
        $(".button-collapse[data-activates='sidemenu']").click(function (e) {
            $("div.drag-target").remove();
            $("body").on("click", "#sidenav-overlay:last-of-type", function (e) {
                $("#menu, #settings").removeClass("flipped");
            });
        });
        $("a[data-flip='settings']").click(function (e) {
            let $flippables = $("#menu, #settings");
            if ($flippables.hasClass("flipped")) {
                $flippables.removeClass("flipped");
            } else {
                $flippables.addClass("flipped");
            }
        });
        $("a[data-activates='users']").click(function () {
            $("div.drag-target").remove();
        });
    }

    private static loadIpcEvents(): void {
        App.ipc.on("openChannel", function (e, data) {
            let {"channel": channel, "nick": nick} = JSON.parse(data);
            UI.login(channel, nick);
        });
    }

    private static loadTabEvents(): void {
        $("#channels-tabs")
            .tabs("init")
            .on("tabOpened", function (e, channelId) {
                if (!UI.channelUIs[channelId].channel.isOnline) {
                    UI.chatInputForm.find("#textfield").attr("disabled", "");
                }
            })
            .on("tabChanged", function (e, channelId) {
                $(".users").css("display", "none");
                let currentChannelUI: ChannelUI = UI.channelUIs[channelId];
                currentChannelUI.usersUI.css("display", "");
                currentChannelUI.unreadMessageCount = 0;
                currentChannelUI.messageCounter.text(0);
                App.currentChannel = channelId;
                if (currentChannelUI.channel.isOnline) {
                    UI.chatInputForm.find("#textfield").removeAttr("disabled");
                    let users: string[] = [];
                    for (let user in UI.channelUIs[channelId].channel.users) {
                        users.push(user);
                    }
                    UI.chatInputForm.find("#textfield").autocomplete("setItems", users);
                }
            })
            .on("tabClosed", function (e, channelId) {
                UI.channelUIs[channelId].close();
                delete UI.channelUIs[channelId];
                if ($(this).find(".tab").length == 0) {
                    UI.chatInputForm.find("#textfield").attr("disabled", "");
                }
            });
        $(".button-collapse").sideNav({
            menuWidth: 300,
            closeOnClick: false
        });
    }

    private static login(channelName: string, nick?: string): void {
        if (nick !== undefined && nick !== null && nick !== "") {
            UI.openChannel(channelName, nick);
        } else if (App.nick === undefined || App.nick === null || App.nick === "" || App.nick.split("#").length > 1 && App.nick.split("#")[1].length == 0) {
            UI.nickPrompt.modal('open');//TODO: give the user a choice in the type of login popup
            UI.nickPrompt.find("input.validate").val(App.nick).data("realNick", App.nick).data("channel", channelName).focus();
        } else {
            UI.openChannel(channelName, App.nick);
        }
    }

    private static openChannel(channelName: string, nick: string): void {
        let channel = new Channel(channelName, nick);
        UI.channelUIs[channel.channelId] = new ChannelUI(channel);
        App.currentChannel = channel.channelId;
    }

    private static loadChannelEvents() {
        let $addChannelForm = $(".addChannel form");
        $addChannelForm.submit(function (e) {
            e.preventDefault();
            UI.login($(this).find("input").val(), null);
            $(this).find("button").css("display", "");
            $(this).find("input").css("display", "none").val("");
        });
        $addChannelForm.find("button").click(function (e) {
            e.preventDefault();
            $(this).css("display", "none");
            $addChannelForm.find("input").css("display", "").focus();
        });
        $addChannelForm.find("input").blur(function (e) {
            $addChannelForm.find("button").css("display", "");
            $(this).css("display", "none");
        });
    }
}

export {UI};