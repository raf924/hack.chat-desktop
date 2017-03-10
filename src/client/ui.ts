///<reference path="../../node_modules/@types/jquery/index.d.ts" />
///<reference path="modules/plugins/index.d.ts"/>
//TODO: add keyboard shortcuts

import {ChannelUI} from "./channelUI"
const titlebar = require('titlebar');
import fs = require('fs');
import {App} from "./app";
import {LoginMethod} from "./loginMethod";
import {Views} from "./views";
import {NotifyConfig} from "./notifyConfig";
import Hammer = require("hammerjs");
import {Tool} from "./tool";
//const mdc = require('material-components-web/dist/material-components-web.min.js');
//const MDCSnackbar: any = mdc.snackbar.MDCSnackbar;

//TODO: subclass UI to allow custom interfaces (remove titlebar from parent class ?)
class UI {
    public static favouritesUI: HTMLElement;
    private static titleBar: Titlebar;
    private static channelUIs: Map<string, ChannelUI>;
    public static notifyConfig: NotifyConfig;
    public static views: Views;
    private static nickPrompt: HTMLElement;
    public static chatInputForm: HTMLFormElement;
    public static channelTabs: Tabs;
    public static channelsContainer: HTMLElement;
    public static loginMethod: LoginMethod;
    public static toolBar: HTMLElement;
    private static snackBar: any;
    public static readonly DEFAULT_ALERT_TIMEOUT = 6000;

    public static get currentChannelUI(): ChannelUI {
        return UI.channelUIs[App.currentChannel_];
    }

    public static isFavourite(channelName: string): boolean {
        return !!UI.favouritesUI.querySelector(`[data-open$='${channelName}']`);
    }

    private static addFavourite(channelName: string) {
        App.addFavourite(channelName);
        let channelTab = <HTMLElement>UI.channelTabs.tabContainer.querySelector(`[for$='${channelName}']`);
        channelTab.dataset["isFav"] = "true";
        channelTab.querySelector(".fav").setAttribute("icon", "star");
        Polymer.dom(UI.favouritesUI).appendChild(document.createElement("div"));
        Polymer.dom.flush();
        let favourite = <HTMLElement>Polymer.dom(UI.favouritesUI[0]).lastElementChild;
        favourite.outerHTML = UI.views.favourite.element;
        favourite = <HTMLElement>UI.favouritesUI.lastChild;
        favourite.dataset["open"] = channelName;
        favourite.querySelector(".name").textContent = channelName;/*
        let visibleHeight: Number = $(UI.favouritesUI).visibleHeight();
        //TODO: see if code below is still applicable
        if (UI.favouritesUI.css("max-height") != visibleHeight.toString() && UI.favouritesUI.height() > visibleHeight) {
            UI.favouritesUI.css("max-height", visibleHeight.toString());
        }*/
    }

    public static init() {
        UI.channelUIs = new Map<string, ChannelUI>();
        //UI.snackBar = new mdc.snackbar.MDCSnackbar($("#alert")[0]);
        //TODO: Load UI components from component/selector maps stored in JSON
        //UI.channelTabs = $("#menu-channels");
        UI.channelsContainer = <HTMLElement>document.querySelector("#channels");
        UI.toolBar = <HTMLElement>document.querySelector("#app-bar");
        UI.loadViews();
        UI.nickPrompt = <HTMLElement>document.querySelector("#nickPrompt");
        UI.chatInputForm = <HTMLFormElement>document.querySelector("#chatInputForm");
        UI.notifyConfig = {
            "onlineSet": false,
            "onlineAdd": true,
            "onlineRemove": true,
            "chat": false,
            "warn": true,
            "info": true
        }; //TODO: get the notify values from the App.userData

        UI.favouritesUI = <HTMLElement>document.querySelector("#menu-favourites");
        UI.favouritesUI.addEventListener("tap", function (e) {
            let target = <HTMLElement>e.currentTarget;
            if(target.matches("paper-item")){
                let [channel, service] = target.dataset["open"].split("@");
                UI.login(channel, service);
            }
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
            document.body.insertBefore(UI.titleBar.element, document.body.firstChild);
            let titleElement = document.createElement("div");
            titleElement.id = "app-title";
            titleElement.innerText = "Chatron";
            UI.titleBar.element.appendChild(titleElement);
            UI.loadTitleBarEvents();
        } else {
            document.body.classList.add("cordova");
        }

        UI.snackBar = Polymer.dom(document.body).querySelector("#alert");
        UI.loadUIEvents();
        UI.loadChatEvents();
        UI.loadLoginEvents();
        UI.loadTabEvents();
        UI.loadChannelEvents();
        UI.loadTools();
        UI.loadServices();
        Polymer.dom(document.body).querySelector("#waitIndicator").active = false;
    }

    private static loadTitleBarEvents(): void {
        for (let event of ["close", "minimize", "fullscreen"]) {
            UI.titleBar.on(event, function () {
                App.ipc.send(event, function () {

                });
            });
        }
    }

    private static loadTools(): void {
        let tools: Tool[];
        let files = [];
        let toolPath = `${__dirname}/modules/tools`;
        if (!App.isCordova) {
            files = fs.readdirSync(toolPath);
            files.forEach(function (file) {
                try {
                    let toolModule = require(`${__dirname}/modules/tools/${file}/${file}`);
                    let tool: Tool = new toolModule[toolModule.toolName]();
                } catch (e) {
                    console.error(`Couldn't load tool '${file}'`);
                }
            });

        } else {
            let r = require.context("./modules/tools", true, /\.js$/);
            files = r.keys();
            for (let tool of files) {
                let toolModule = r(tool);
                new toolModule[toolModule.toolName]();
            }
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
        UI.chatInputForm.addEventListener("submit", function (e) {
            e.preventDefault();
        });
        UI.chatInputForm.querySelector("#chatBox").addEventListener("keydown", function (e: KeyboardEvent) {
            if (e.keyCode === 13 && !e.shiftKey) {
                e.preventDefault();
                UI.currentChannelUI.channel.sendMessage((<HTMLInputElement>e.currentTarget).value);
                (<HTMLInputElement>e.currentTarget).value = "";
            }
            //TODO: add commands handling
            //TODO: add history
        });
        if (!App.isCordova) {
            $(UI.chatInputForm.querySelector("#chatBox")).autocomplete();
        }
        window.onresize = function (ev) {
            if (App.currentChannel_ != null && UI.currentChannelUI.isAtBottom) {
                UI.currentChannelUI.scrollToBottom();
            }
        };
    }

    private static loadLoginEvents(): void {
        App.userData.get("loginMethod", function (loginMethod) {
            let method = require(`${__dirname}/modules/login/${loginMethod}/${loginMethod}`);
            UI.loginMethod = new method[method.className]();
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
            };
            UI.loginMethod.oncancel = () => {
                UI.loginMethod.close();
            }
        });
    }

    private static toggleDrawer(state?: boolean) {
        let panel = Polymer.dom(document.body).querySelector("#sidemenu");
        if (state || state == null) {
            panel.openDrawer();
        } else {
            panel.closeDrawer();
        }

    }

    private static loadUIEvents(): void {
        this.channelTabs.tabContainer.addEventListener("click", function (e) {
            e.preventDefault();
            let target = <HTMLElement>e.currentTarget;
            if (target.classList.contains("fav")) {
                let channelName = target.dataset["add"];
                if (!UI.isFavourite(channelName)) {
                    UI.addFavourite(channelName);
                }
            }
        });
        document.querySelector("#sidemenu-collapse").addEventListener("tap", function () {
            UI.toggleDrawer();
        });
        Polymer.dom(document.body).querySelectorAll("paper-submenu").forEach(function (el: HTMLElement) {
            el.addEventListener("paper-submenu-close", function () {
                (<any>el.querySelector(".menu-trigger iron-icon")).icon = "expand-more";
            });
            el.addEventListener("paper-submenu-open", function () {
                (<any>el.querySelector(".menu-trigger iron-icon")).icon = "expand-less";
            });
        });
    }

    private static loadIpcEvents(): void {
        App.ipc.on("openChannel", function (e, data) {
            let {channel, service, nick, password} = JSON.parse(data);
            UI.login(channel, service, nick, password);
        });
    }

    private static loadTabEvents(): void {
        let tabContainer = <HTMLElement>document.querySelector("#menu-channels");
        this.channelTabs = new Tabs(tabContainer, "#channels");
        tabContainer.addEventListener("tabs.opened", function (e: CustomEvent) {
            if (!UI.channelUIs[e.detail.tabId].channel.isOnline) {
                //UI.chatInputForm.find("#chatBox").attr("disabled", "");
            }
        });

        tabContainer.addEventListener("tabs.changed", function (e: CustomEvent) {
            let channelId = e.detail.tabId;
            let currentChannelUI: ChannelUI = UI.channelUIs[channelId];
            if (currentChannelUI != null) {
                currentChannelUI.unreadMessageCount = 0;
                currentChannelUI.messageCounter.innerText = "0";
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
            document.title = `Chatron - ${currentChannelUI.channel.nick}${currentChannelUI.channel.name}@${currentChannelUI.channel.service}`;
            UI.titleBar.element.querySelector("#app-title").textContent = `${currentChannelUI.channel.nick}${currentChannelUI.channel.name}@${currentChannelUI.channel.service}`;
        });
        tabContainer.addEventListener("tabs.closed", function (e: CustomEvent) {
            UI.closeChannelUI(e.detail.tabId);
        });
    }

    public static closeChannelUI(channelId) {
        UI.channelUIs[channelId].close();
        delete UI.channelUIs[channelId];
        if (UI.channelTabs.count === 0) {
            UI.chatInputForm.parent().attr("hidden", "true");
        }
        if (channelId === App.currentChannel_) {
            App.currentChannel = null;
        }
    }

    private static login(channelName: string, service: string, nick ?: string, password ?: string): void {
        if (nick !== undefined && nick !== null && nick !== ""
        ) {
            UI.openChannel(service, channelName, nick, password);
        }
        else if (App.nick === undefined || App.nick === null || App.nick === "") {
            //UI.nickPrompt.modal('open');//TODO: give the user a choice in the type of login popup
            UI.loginMethod.open(channelName, service);
            UI.toggleDrawer(false);
            //UI.nickPrompt.find("input").focus();
        } else {
            UI.openChannel(service, channelName, App.nick, App.password);
        }
    }

    private static openChannel(service: string, channelName: string, nick: string, password: string): void {
        let channel = App.openChannel(service, channelName, nick, password);
        UI.channelUIs[channel.channelId] = new ChannelUI(channel);
    }

    private static loadChannelEvents() {
        let channelDialog = Polymer.dom(document.body).querySelector("#newChannelDialog");
        let channelForm = Polymer.dom(channelDialog).querySelector("#newChannelForm");
        Polymer.dom(document.body).querySelector("#addChannel").addEventListener("tap", function () {
            Polymer.dom(channelForm).querySelector("#serviceChoice").select(null);
            channelForm.reset();
            channelDialog.open();
        });
        channelDialog.addEventListener("iron-overlay-closed", function (e) {
            if (e.target !== e.currentTarget) {
                return;
            }

            let event = Polymer.dom(e);
            if (event.event.detail.confirmed) {
                if (channelForm.validate()) {
                    channelForm.submit();
                } else {
                    channelDialog.open();
                }
            }
        });
        channelForm.addEventListener("iron-form-submit", function (e) {
            e.preventDefault();
            let {channelName, service} = channelForm.serialize();
            UI.login(channelName, service);
            channelForm.reset();
        });
    }

    public static alert(text: string, timeout?: number, actionText?: string, actionHandler?: () => {}): void {
        UI.snackBar.duration = timeout || UI.DEFAULT_ALERT_TIMEOUT;
        let actionButton = Polymer.dom(UI.snackBar).querySelector("#alertAction");
        actionButton.innerText = actionText;
        actionButton.addEventListener("tap", function () {
            UI.snackBar.close();
            actionHandler();
        });
        UI.snackBar.text = text;
        UI.snackBar.open();
    }

    private static loadServices() {
        let select = Polymer.dom(document.body).querySelector("#serviceChoice");
        for (let service in App.services) {
            let option = document.createElement("paper-item");
            option.innerText = service;
            option.dataset["service"] = service;
            Polymer.dom(select).appendChild(option);
            Polymer.dom(select).flush();
        }
    }
}

export {UI};