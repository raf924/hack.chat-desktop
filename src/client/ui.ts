///<reference path="../../node_modules/@types/jquery/index.d.ts" />
///<reference path="../../node_modules/@types/materialize-css/index.d.ts"/>
///<reference path="plugins/visibleHeight.d.ts"/>
///<reference path="plugins/tabs.d.ts"/>

//TODO: add keyboard shortcuts

import {ChannelUI} from "./channelUI"
const titlebar = require('titlebar');
import fs = require('fs');
import {View} from "./view";
import {Channel} from "./channel";

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
    appendTo(el: HTMLElement): Function;
    element: HTMLElement;
    destroy(): Function;
    on(event: string, callback: Function): Function;
}

export interface NotifyConfig {
    onlineSet: boolean,
    onlineAdd: boolean,
    onlineRemove: boolean,
    chat: boolean,
    warn: boolean
}

class UI {
    static message_icons: MessageIcon;
    private static favourites: string[];
    private static favouritesUI: JQuery;
    private static titleBar: Titlebar;
    private static ipc: Electron.IpcRenderer;
    private static nick: string;
    public static currentChannel: string;
    private static parsers: Function[];
    private static channelUIs: Map<string, ChannelUI>;
    public static notifyConfig: NotifyConfig;
    public static views: Views;
    private static nickPrompt: JQuery;

    private static addFavourite(channelName: string) {
        UI.favourites.push(channelName);
        let $favouriteLink = $("<a>").attr("href", "#").attr("data-open", channelName).text(channelName);
        let $favourite = $("<li>").append($favouriteLink);
        UI.favouritesUI.append($favourite);
        let visibleHeight: Number = UI.favouritesUI.visibleHeight();
        if (UI.favouritesUI.css("max-height") != visibleHeight.toString() && UI.favouritesUI.height() > visibleHeight) {
            UI.favouritesUI.css("max-height", visibleHeight.toString());
        }
    }

    public static init() {
        UI.channelUIs = new Map<string, ChannelUI>();
        UI.favourites = [];
        UI.parsers = [];
        UI.loadViews();
        UI.nickPrompt = $("#nickPrompt");
        UI.nickPrompt.modal();
        UI.notifyConfig = {
            "onlineSet": false,
            "onlineAdd": true,
            "onlineRemove": true,
            "chat": true,
            "warn": true
        }; //TODO: get the notify values from the config file
        UI.ipc = require('electron').ipcRenderer;
        UI.nick = UI.ipc.sendSync("get", "nickName");
        UI.titleBar = titlebar();
        UI.titleBar.appendTo(document.body);
        $(UI.titleBar.element).append($("<div>").text("Chatron"));
        UI.loadParsers();

        UI.favouritesUI = $("#favourites");
        UI.favouritesUI.on("click", "li a[data-open]", function (e) {
            UI.login($(this).attr("data-open"));
        });

        UI.message_icons = require("../data/message_icons.json");

        UI.loadUIEvents();
        UI.loadChatEvents();
        UI.loadIpcEvents();
        UI.loadLoginEvents();
        UI.loadTabEvents();
        UI.loadChannelEvents();
    }

    private static loadTitleBarEvents(): void {
        for (let event in ["close", "minimize", "fullscreen"]) {
            UI.titleBar.on(event, function (e) {
                UI.ipc.send(event, function () {

                });
            });
        }
    }

    private static loadViews(): void {
        UI.views = new Views();
    }

    private static loadParsers(): void {
        fs.readdir("./parsers", function (err, files) {
            files.forEach(function (file) {
                let parser: Function = require(`../../parsers/${file}`).parse;
                UI.parsers.push(parser);
            });
        });
    }

    static parseText(text: string): string {
        UI.parsers.forEach(function (parser) {
            text = parser.apply(null, text);
        });
        return text;
    }

    private static insertAtCursor(text): void {
        let textfield: HTMLTextAreaElement = <HTMLTextAreaElement>$("form#send #textfield")[0];
        let pos = textfield.selectionStart || 0;
        let value = textfield.value;
        textfield.value = [value.slice(0, pos), text, value.slice(pos)].join('');
        textfield.selectionStart = pos + text.length;
    }

    private static loadChatEvents(): void {
        $("form#send").submit(function (e) {
            e.preventDefault();
        });
        $("form#send #textfield").keydown(function (e) {
            if (e.keyCode === 13 && !e.shiftKey) {
                e.preventDefault();
                UI.channelUIs[UI.currentChannel].channel.sendMessage($(this).val());
                $(this).val("");
            }
            //TODO: add nickname autocompletion
            //TODO: add commands handling
            //TODO: add history
        });
    }

    private static loadLoginEvents(): void {
        UI.nickPrompt.find("form").submit(function (e) {
            e.preventDefault();
            let $nick = $(this).find("input.validate");
            let nick = $nick.data("realNick");
            UI.ipc.send("join", JSON.stringify({"channel": $nick.data("channel"), "nick": nick}));
            $nick.val("").data("realNick", "").data("channel", "");
            let forAll = $(this).find("#forAll:checked");
            if (forAll.length > 0) {
                UI.ipc.send("set", JSON.stringify({
                    prop: "nickName",
                    value: nick.split("#")[0] + "#"
                }));
                UI.nick = nick;
            }
            UI.nickPrompt.modal('close');
            if (document.body.clientWidth < 992) {
                $(".button-collapse").sideNav("hide");
            }
        });
        UI.nickPrompt.find("form input.validate").keydown(function (e) {
            let target: HTMLInputElement = <HTMLInputElement> e.currentTarget;
            $(this).data("keyCode", e.keyCode);
            if ((e.keyCode !== 8 && e.keyCode != 46) || $(this).data("selectionStart") == null) {
                $(this).data("selectionEnd", target.selectionEnd);
                $(this).data("selectionStart", target.selectionStart);
            }
        }).click(function (e) {
            let target: HTMLInputElement = <HTMLInputElement> e.currentTarget;
            $(this).data("selectionEnd", target.selectionEnd);
            $(this).data("selectionStart", target.selectionStart);
        }).on("select", function (e) {
            let target: HTMLInputElement = <HTMLInputElement> e.currentTarget;
            $(this).data("selectionEnd", target.selectionEnd);
            $(this).data("selectionStart", target.selectionStart);
        }).on("input", function (e) {
            if ($(this).data("realNick") == null) {
                $(this).data("realNick", "");
            }
            if ($(this).data("keyCode") == 8 || $(this).data("keyCode") == 46) {
                let oldNick = $(this).data("realNick");
                let before = oldNick;
                switch ($(this).data("keyCode")) {
                    case 8://BACKSPACE
                        before = oldNick.slice(0, $(this).data("selectionStart") - 1);
                        break;
                    case 46://DELETE
                        before = oldNick.slice(0, $(this).data("selectionStart"));
                        break;
                }
                let after = oldNick.slice($(this).data("selectionEnd") + 1);
                $(this).data("realNick", before + after);
            } else {
                let target: HTMLInputElement = <HTMLInputElement> e.currentTarget;
                let nick = target.value;
                let idxStart = $(this).data("selectionStart") || target.selectionStart - 1;
                let idxEnd = $(this).data("selectionEnd") || target.selectionStart;
                let newChar = nick[idxStart];
                $(this).data("realNick", `${$(this).data("realNick").slice(0, idxStart)}${newChar}${$(this).data("realNick").slice(idxEnd)}`);
                let matches = nick.match(/#(.+)/i);
                if (matches !== null) {
                    let password = matches[1];
                    target.value = nick.replace(/#(.+)/, `#${password.replace(/./g, "*")}`);
                }
            }
            $(this).data("selectionStart", null);
            $(this).data("selectionEnd", null);
            $(this).data("keyCode", null);
        });
    }

    private static loadUIEvents(): void {
        $("#menu").on("click", "a.fav", function (e) {
            e.preventDefault();
            UI.addFavourite($(this).attr("data-add"));
            UI.ipc.send("set", {
                prop: "favourites",
                value: UI.favourites
            });
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
        UI.ipc.on("openChannel", function (e, data) {
            let {"channel": channel, "nick": nick} = JSON.parse(data);
            UI.login(channel, nick);
        });
        UI.ipc.on("favourites", function (event, favourites) {
            favourites.forEach(function (favourite) {
                UI.addFavourite(favourite);
            });
        });
        UI.ipc.send("get", "favourites", true);
    }

    private static loadTabEvents(): void {
        $("#channels-tabs")
            .tabs("init")
            .on("tabChanged", function (e, channelId) {
                //TODO: show users
                $(".users").css("display", "none");
                UI.channelUIs[channelId].usersUI.css("display", "");
                UI.channelUIs[channelId].unreadMessageCount = 0;
                UI.channelUIs[channelId].messageCounter.text(0);
                UI.currentChannel = channelId;
            })
            .on("tabClosed", function (e, channelId) {
                UI.channelUIs[channelId].close();
                delete UI.channelUIs[channelId];
                if ($(this).find(".tab").length == 0) {
                    $("#send").find("textarea").attr("disabled", "");
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
        } else if (UI.nick === null || UI.nick === "" || UI.nick.split("#").length > 1 && UI.nick.split("#")[1].length == 0) {
            UI.nickPrompt.modal('open');
            UI.nickPrompt.find("input.validate").val(UI.nick).data("realNick", UI.nick).data("channel", channelName);
        } else {
            UI.openChannel(channelName, UI.nick);
        }
    }

    private static openChannel(channelName: string, nick: string): void {
        let channel = new Channel(channelName, nick);
        UI.channelUIs[channel.channelId] = new ChannelUI(channel);
        UI.currentChannel = channel.channelId;
    }

    private static loadChannelEvents() {
        let $addChannelForm = $(".addChannel form");
        $addChannelForm.submit(function (e) {
            e.preventDefault();
        });
        $addChannelForm.find("button").click(function (e) {
            e.preventDefault();
            $(this).css("display", "none");
            $addChannelForm.find("input").css("display", "").focus();
        });
        $addChannelForm.find("input").keydown(function (e) {
            if (e.keyCode === 13) {
                UI.login($(this).val(), null);
                $addChannelForm.find("button").css("display", "");
                $(this).css("display", "none");
                $(this).val("");
            }
        }).blur(function (e) {
            $addChannelForm.find("button").css("display", "");
            $(this).css("display", "none");
        });
    }
}

export {UI};