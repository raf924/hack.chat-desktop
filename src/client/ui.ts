///<reference path="../../node_modules/@types/jquery/index.d.ts" />
///<reference path="plugins/index.d.ts"/>
//TODO: add keyboard shortcuts

import {ChannelUI} from "./channelUI"
const titlebar = require('titlebar');
import fs = require('fs');
import {App} from "./app";
import {LoginMethod} from "./loginMethod";
import {Views} from "./views";
import {NotifyConfig} from "./notifyConfig";
import Hammer = require("hammerjs");
const mdc = require('material-components-web/dist/material-components-web.min.js');
const MDCSnackbar: any = mdc.snackbar.MDCSnackbar;

//TODO: subclass UI to allow custom interfaces (remove titlebar from parent class ?)
class UI {
    public static favouritesUI: JQuery;
    private static titleBar: Titlebar;
    private static channelUIs: Map<string, ChannelUI>;
    public static notifyConfig: NotifyConfig;
    public static views: Views;
    private static nickPrompt: JQuery;
    public static chatInputForm: JQuery;
    public static channelTabs: JQuery;
    public static channelsContainer: JQuery;
    public static loginMethod: LoginMethod;
    private static snackBar: any;
    public static readonly DEFAULT_ALERT_TIMEOUT = 2750;

    public static get currentChannelUI(): ChannelUI {
        return UI.channelUIs[App.currentChannel];
    }

    public static isFavourite(channelName: string): boolean {
        return UI.favouritesUI.find(`[for$='${channelName}']`).length === 1;
    }

    private static addFavourite(channelName: string) {
        App.addFavourite(channelName);
        UI.channelTabs.find(`[for$='${channelName}']`).attr("data-is-fav", "true");
        let $favourite = $(UI.views.favourite.element).attr("data-open", channelName).text(channelName);
        UI.favouritesUI.append($favourite);
        let visibleHeight: Number = UI.favouritesUI.visibleHeight();
        if (UI.favouritesUI.css("max-height") != visibleHeight.toString() && UI.favouritesUI.height() > visibleHeight) {
            UI.favouritesUI.css("max-height", visibleHeight.toString());
        }
    }

    public static init() {
        UI.channelUIs = new Map<string, ChannelUI>();
        UI.snackBar = new mdc.snackbar.MDCSnackbar($("#alert")[0]);
        //TODO: Load UI components from component/selector maps stored in JSON
        UI.channelTabs = $("#menu-channels");
        UI.channelsContainer = $("#channels");
        UI.loadViews();
        UI.nickPrompt = $("#nickPrompt");
        UI.chatInputForm = $("form#chatInputForm");
        UI.notifyConfig = {
            "onlineSet": false,
            "onlineAdd": true,
            "onlineRemove": true,
            "chat": true,
            "warn": true
        }; //TODO: get the notify values from the App.userData

        UI.favouritesUI = $("#menu-favourites");
        UI.favouritesUI.on("click", "li", function (e) {
            let [channel, service] = $(this).attr("data-open").split("@");
            UI.login(channel, service);
        });
        App.userData.get("favourites", function (favourites) {
            favourites.forEach(function (favourite) {
                UI.addFavourite(favourite);
            });
        });

        if (!App.isCordova) {
            UI.loadIpcEvents();
            UI.titleBar = titlebar();
            UI.titleBar.appendTo(document.body);
            $(UI.titleBar.element).append($("<div>").text("Chatron"));
            UI.titleBar.element.classList.add("mdc-elevation--z4");
            UI.loadTitleBarEvents();
        } else {
            document.body.classList.add("cordova");
        }
        UI.loadUIEvents();
        UI.loadChatEvents();
        UI.loadLoginEvents();
        UI.loadTabEvents();
        UI.loadChannelEvents();
        UI.snackBar = new MDCSnackbar($("#alert")[0]);
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

    static insertAtCursor(text): void {
        let chatBox: HTMLTextAreaElement = <HTMLTextAreaElement>UI.chatInputForm.find("#chatBox")[0];
        let pos = chatBox.selectionStart || 0;
        let value = chatBox.value;
        chatBox.value = [value.slice(0, pos), text, value.slice(pos)].join('');
        chatBox.selectionStart = pos + text.length;
        chatBox.focus();
    }

    private static loadChatEvents(): void {
        //let that = this;
        UI.chatInputForm.submit(function (e) {
            e.preventDefault();
        }).find("#chatBox").keydown(function (e) {
            if (e.keyCode === 13 && !e.shiftKey) {
                e.preventDefault();
                UI.channelUIs[App.currentChannel].channel.sendMessage($(this).val());
                $(this).val("");
            }
            //TODO: add commands handling
            //TODO: add history
        });
        if (!App.isCordova) {
            UI.chatInputForm.find("#chatBox").autocomplete();
        }
        window.onresize = function (ev) {
            if (App.currentChannel != null && UI.channelUIs[App.currentChannel].isAtBottom) {
                UI.channelUIs[App.currentChannel].scrollToBottom();
            }
        };
    }

    private static loadLoginEvents(): void {
        //TODO: prefill userData
        App.userData.get("loginMethod", function (loginMethod) {
            let method = require(`${__dirname}/login/${loginMethod}`);
            UI.loginMethod = new method[method.className](UI.nickPrompt[0]);
            UI.loginMethod.onsuccess = (channelName, service, nick, password, useAlways) => {
                if (!App.isCordova) {
                    App.ipc.send("join", JSON.stringify({
                        "channel": channelName,
                        "service": service,
                        "nick": nick,
                        "password": password
                    }));
                } else {
                    UI.login(channelName, service, nick, password);
                }
                if (useAlways) {
                    App.userData.set("nickName", nick);
                    App.userData.set("password", password);
                    App.nick = nick;
                    App.password = password;
                }
                UI.loginMethod.close();

                if (document.body.clientWidth < 992) {
                    //TODO: hide drawer if smallscreen
                    //$(".button-collapse").sideNav("hide");
                }
            };
            UI.loginMethod.oncancel = (channelName) => {
                UI.loginMethod.close();
            }
        });
    }

    private static toggleDrawer(state?: boolean) {
        $("#sidemenu").toggleClass("open", state);
        $("#sidemenu-overlay").toggleClass("hidden", state == null ? state : !state);
    }

    private static loadUIEvents(): void {
        this.channelTabs.on("click", ".fav", function (e) {
            e.preventDefault();
            let channelName = $(this).attr("data-add");
            if (!UI.isFavourite(channelName)) {
                UI.addFavourite(channelName);
            }
        });
        $("#sidemenu-collapse").click(function (eventObject) {
            UI.toggleDrawer();
        });
        $("#sidemenu-overlay").click(function (e) {
            UI.toggleDrawer(false);
        });
        if (App.isCordova) {
            let hammerTime = new Hammer(document.body);
            hammerTime.on("swiperight", function (ev) {
                UI.toggleDrawer(true);
            });
        }
        $("#sidemenu").on("click", "ul li", function () {
            UI.toggleDrawer(false);
        });
    }

    private static loadIpcEvents(): void {
        App.ipc.on("openChannel", function (e, data) {
            let {channel, service, nick, password} = JSON.parse(data);
            UI.login(channel, service, nick, password);
        });
    }

    private static loadTabEvents(): void {
        $("#menu-channels"
        )
            .tabs("init")
            .on("tabs.opened", function (e, channelId) {
                if (!UI.channelUIs[channelId].channel.isOnline) {
                    //UI.chatInputForm.find("#chatBox").attr("disabled", "");
                }
            })
            .on("tabs.changed", function (e, channelId) {
                $(".users").css("display", "none");
                let currentChannelUI: ChannelUI = UI.channelUIs[channelId];
                if (currentChannelUI != null) {
                    //currentChannelUI.usersUI.css("display", "");
                    currentChannelUI.unreadMessageCount = 0;
                    currentChannelUI.messageCounter.text(0);
                    App.currentChannel = channelId;
                    if (currentChannelUI.channel.isOnline) {
                        UI.chatInputForm.parent().removeAttr("hidden");
                        let users: string[] = [];
                        for (let user in UI.channelUIs[channelId].channel.users) {
                            users.push(user);
                        }
                        UI.chatInputForm.find("#chatBox").autocomplete("setItems", users);
                    }
                }
                document.title = `Chatron - ${currentChannelUI.channel.name}@${currentChannelUI.channel.service}`;
            })
            .on("tabs.closed", function (e, channelId) {
                UI.closeChannelUI(channelId);
            });
//TODO: add button to open drawer on small screens
    }

    public static closeChannelUI(channelId){
        UI.channelUIs[channelId].close();
        delete UI.channelUIs[channelId];
        if(UI.channelTabs.find(".tab").length === 0){
            UI.chatInputForm.parent().attr("hidden", "true");
        }
    }

    private static login(channelName: string, service: string, nick ?: string, password ?: string): void {
        if (nick !== undefined && nick !== null && nick !== ""
        ) {
            UI.openChannel(channelName, nick, password);
        }
        else if (App.nick === undefined || App.nick === null || App.nick === "") {
            //UI.nickPrompt.modal('open');//TODO: give the user a choice in the type of login popup
            UI.loginMethod.open(channelName, service);
            UI.toggleDrawer(false);
            UI.nickPrompt.find("input").focus();
        } else {
            UI.openChannel(channelName, App.nick, App.password);
        }
    }

    private static openChannel(channelName: string, nick: string, password: string): void {
        let channel = App.openChannel(channelName, nick, password);
        UI.channelUIs[channel.channelId] = new ChannelUI(channel);
    }

    private static loadChannelEvents() {
        let $addChannelForm = $("#addChannel form");
        $addChannelForm.submit(function (e) {
            e.preventDefault();
            let [channel, service] = $(this).find("input").val().split("@");
            UI.login(channel, service);
            $(this).find("button").css("display", "");
            $(this).find("input").val("").parent().css("display", "none");
        });
        $addChannelForm.find("button").click(function (e) {
            e.preventDefault();
            $(this).css("display", "none");
            $addChannelForm.find("input").parent().css("display", "").find("input").focus();
        });
        $addChannelForm.find("input").blur(function (e) {
            $addChannelForm.find("button").css("display", "");
            $(this).parent().css("display", "none");
        });
    }

    public static alert(text: string, timeout?: number, actionText?: string, actionHandler?: () => {}): void {
        UI.snackBar.show({
            message: text,
            actionText: actionText,
            actionHandler: actionHandler,
            timeout: timeout || UI.DEFAULT_ALERT_TIMEOUT
        });
    }
}

export {UI};