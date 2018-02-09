///<reference path="../types/Polymer.d.ts"/>
//TODO: add keyboard shortcuts

import {App} from "./app";
import {LoginMethod} from "./loginMethod";
import {Views} from "./views";
import {NotifyConfig} from "./notifyConfig";
// import {Tool} from "./tool";
import {Tabs} from "./tabs";
import {Autocomplete} from "./autocomplete";
import {UIChannels} from "./elements/ui-channels";
import {ChannelTabs} from "./elements/ui-channel-tabs";
import {Favourite, Favourites} from "./elements/ui-favourites";
import {ServiceManager} from "./serviceManager";

//TODO: subclass UI to allow custom interfaces (remove titlebar from parent class ?)
class UI extends Polymer.PropertyEffects(Object) {
    public favouritesUI: Favourites;
    private titleBar: TitleBar;
    public notifyConfig: NotifyConfig;
    public views: Views;
    private nickPrompt: HTMLElement;
    public chatInputForm: HTMLFormElement;
    public chatBox: HTMLTextAreaElement | Autocomplete;
    public channelTabs: Tabs;
    public channelsContainer: HTMLElement;
    public loginMethod: LoginMethod;
    public toolBar: HTMLElement;
    private snackBar: any;
    public static readonly DEFAULT_ALERT_TIMEOUT = 6000;
    private channelsUI: UIChannels;
    public static instance: UI;

    public static load(): UI {
        if (!UI.instance) {
            UI.instance = new UI();
        }
        return UI.instance;
    }

    public static get properties() {
        return {
            favouriteUI: {
                type: Favourites
            }, channelsUI: {
                type: UIChannels
            }
        };
    }

    constructor() {
        super();
        require(`style-loader!${__dirname}/../less/app.less`)();
        //UI.snackBar = new mdc.snackbar.MDCSnackbar($("#alert")[0]);
        //TODO: Load UI components from component/selector maps stored in JSON
        this.loadUIComponents();

        this.notifyConfig = {
            "onlineSet": false,
            "onlineAdd": true,
            "onlineRemove": true,
            "chat": false,
            "warn": true,
            "info": true
        }; //TODO: get the notify values from the App.userData

        this.loadUIEvents();
        this.loadChatEvents();
        this.loadLoginEvents();
        this.loadTabEvents();
        this.loadChannelEvents();
        this.loadTools();
        this.loadServices();
        (<any>document.querySelector("#waitIndicator")).active = false;
    }

    public isFavourite(channelName: string): boolean {
        return !!this.favouritesUI.querySelector(`[data-open$='${channelName}']`);
    }

    private addFavourite(channelName: string) {
        let favourite: Favourite = {name: null, service: null};
        [favourite.name, favourite.service] = channelName.split("@");
        App.load().addFavourite(favourite);
        (<ChannelTabs>this.channelTabs.tabContainer).addFavourite(favourite);
        this.favouritesUI.addFavourite(favourite);
        /*
         //TODO: see if code below is still applicable
         if (UI.favouritesUI.css("max-height") != visibleHeight.toString() && UI.favouritesUI.height() > visibleHeight) {
         UI.favouritesUI.css("max-height", visibleHeight.toString());
         }*/
    }

    private loadTitleBarEvents(): void {
        for (let event of ["close", "minimize", "fullscreen"]) {
            this.titleBar.on(event, function () {
                App.load().ipc.send(event, function () {

                });
            });
        }
    }

    private loadUIComponents(): void {
        this.channelsContainer = <HTMLElement>document.querySelector("#channels");
        this.toolBar = <HTMLElement>document.querySelector("#app-bar");
        this.loadViews();
        this.nickPrompt = <HTMLElement>document.querySelector("#nickPrompt");
        this.chatInputForm = <HTMLFormElement>document.querySelector("#chatInputForm");
        this.chatBox = !App.isElectron ? <HTMLTextAreaElement>document.querySelector("#chatBox") :
            new Autocomplete(<HTMLTextAreaElement>document.querySelector("#chatBox"));
        this.channelTabs = new Tabs("menu-channels", "channels");
        this.favouritesUI = <Favourites>document.querySelector("#menu-favourites");
        if (App.isElectron) {
            this.loadIpcEvents();
            this.titleBar = window.TitleBar;
            this.titleBar.appendTo(document.body);
            document.body.insertBefore(this.titleBar.element, document.body.firstChild);
            let titleElement = document.createElement("div");
            titleElement.id = "app-title";
            titleElement.innerText = "Chatron";
            this.titleBar.element.appendChild(titleElement);
            this.loadTitleBarEvents();
        } else {
            document.body.classList.add("cordova");
        }
        this.snackBar = document.querySelector("#alert");
    }

    private loadTools(): void {
        let r = require.context("./modules/tools", true, /\.ts/);
        let files = r.keys();
        for (let tool of files) {
            let toolClass = r(tool).default;
            (<any>document.querySelector("#toolbar")).push("tools", {is: toolClass.is});
        }
    }

    private loadViews(): void {
        this.views = new Views();
    }

    insertAtCursor(text): void {
        let chatBox: HTMLTextAreaElement = <HTMLTextAreaElement>this.chatInputForm.find("#chatBox")[0];
        let pos = chatBox.selectionStart || 0;
        let value = chatBox.value;
        chatBox.value = [value.slice(0, pos), text, value.slice(pos)].join('');
        chatBox.selectionStart = pos + text.length;
        chatBox.focus();
    }

    private loadChatEvents(): void {
        this.chatInputForm.addEventListener("submit", function (e) {
            e.preventDefault();
        });
        this.chatInputForm.querySelector("#chatBox").addEventListener("keydown", function (e: KeyboardEvent) {
            if (e.keyCode === 13 && !e.shiftKey) {
                e.preventDefault();
                this.currentChannelUI.channel.sendMessage((<HTMLInputElement>e.currentTarget).value);
                (<HTMLInputElement>e.currentTarget).value = "";
            }
            //TODO: add commands handling
            //TODO: add history
        });
        window.onresize = function (ev) {
            if (App.load().currentChannel_ != null && this.currentChannelUI.isAtBottom) {
                this.currentChannelUI.scrollToBottom();
            }
        }.bind(this);
    }

    private toggleDrawer(state?: boolean) {
        let panel = <AppDrawer>document.querySelector("#sidemenu");
        if (panel.persistent) {
            return;
        }
        if (state || state == null) {
            panel.close();
        } else {
            panel.close();
        }
    }

    private loadUIEvents(): void {
        //TODO: move this to the ui-channel component
        this.channelTabs.tabContainer.addEventListener("click", function (e) {
            e.preventDefault();
            let target = <HTMLElement>e.currentTarget;
            if (target.classList.contains("fav")) {
                let channelName = target.dataset["add"];
                if (!this.isFavourite(channelName)) {
                    this.addFavourite(channelName);
                }
            }
        }.bind(this));
        document.querySelector("#sidemenu-collapse").addEventListener("tap", function () {
            this.toggleDrawer();
        });
        document.querySelectorAll("ui-collapse").forEach(function (el: HTMLElement) {
            el.addEventListener("closed", function () {
                (<any>el.querySelector("iron-icon")).icon = "expand-more";
            });
            el.addEventListener("opened", function () {
                (<any>el.querySelector("iron-icon")).icon = "expand-less";
            });
        });
    }

    private loadIpcEvents(): void {
        App.load().ipc.on("openChannel", function (e, data) {
            let {channel, service, nick, password} = JSON.parse(data);
            if (channel && service && nick) {
                this.login(channel, service, nick, password);
            } else {
                this.alert("There was an error during login");
            }
        });
    }

    private loadTabEvents(): void {
        this.channelTabs.tabContainer.addEventListener("tabs.opened", function (e: CustomEvent) {
            if (!this.channelUIs[e.detail.tabId].channel.isOnline) {
                //UI.chatInputForm.find("#chatBox").attr("disabled", "");
            }
        });

        this.channelTabs.tabContainer.addEventListener("tabs.changed", function (e: CustomEvent) {
            document.dispatchEvent(new CustomEvent("channel.changed", {
                detail: {
                    channelId: e.detail.tabId
                }
            }));
            /*
            let channelId = e.detail.tabId;
            if (currentChannelUI != null) {
                currentChannelUI.unreadMessageCount = 0;
                currentChannelUI.messageCounter.innerText = "0";
                App.load().currentChannel = channelId;
                if (currentChannelUI.channel.isOnline) {
                    this.chatInputForm.parent().removeAttr("hidden");
                    let users: string[] = [];
                    for (let user in this.channelUIs[channelId].channel.users) {
                        users.push(user);
                    }
                    if (App.isElectron) {
                        (<Autocomplete>this.chatBox).items = users;
                    }
                }
                document.title = `Chatron - ${currentChannelUI.channel.nick}${currentChannelUI.channel.name}@${currentChannelUI.channel.service}`;
                this.titleBar.element.querySelector("#app-title").textContent = `${currentChannelUI.channel.nick}${currentChannelUI.channel.name}@${currentChannelUI.channel.service}`;
            }*/
        });
        this.channelTabs.tabContainer.addEventListener("tabs.closed", function (e: CustomEvent) {
            this.closeChannelUI(e.detail.tabId);
        });
        this.favouritesUI.addEventListener("favourite.tapped", function (e: CustomEvent) {
            let {name, service} = e.detail;
            this.login(name, service);
        });
        this.favouritesUI.addEventListener("favourite.remove", function (e: CustomEvent) {
            //TODO: remove favourite
            (<ChannelTabs>this.channelTabs.tabContainer).removeFavourite(e.detail);
        });
        App.load().userData.get("favourites", function (favourites) {
            favourites.forEach(function (favourite) {
                this.addFavourite(favourite);
            });
        });
    }

    public closeChannelUI(channelId) {
        this.channelsUI.closeChannel(channelId);
        //UI.channelUIs[channelId].close();
        //delete UI.channelUIs[channelId];
        if (this.channelTabs.count === 0) {
            this.chatInputForm.parent().attr("hidden", "true");
        }
        if (channelId === App.load().currentChannel_) {
            App.load().currentChannel = null;
        }
    }

    private login(channelName: string, service: string, nick ?: string, password ?: string): void {
        if (nick !== undefined && nick !== null && nick !== ""
        ) {
            this.openChannel(service, channelName, nick, password);
        }
        else if (App.load().nick === undefined || App.load().nick === null || App.load().nick === "") {
            //TODO: give the user a choice in the type of login popup
            this.loginMethod.open(channelName, service);
            this.toggleDrawer(false);
        } else {
            this.openChannel(service, channelName, App.load().nick, App.load().password);
        }
    }

    private openChannel(service: string, channelName: string, nick: string, password: string): void {
        let channel = App.load().openChannel(service, channelName, nick, password);
        this.channelsUI.addChannel(channel);
    }

    private loadChannelEvents() {
        let channelDialog = document.querySelector("#newChannelDialog");
        let channelForm = channelDialog.querySelector("#newChannelForm");
        document.querySelector("#addChannel").addEventListener("tap", function () {
            channelForm.querySelector("#serviceChoice")["select"](null);
            channelForm["reset"]();
            channelDialog["open"]();
        });
        channelDialog.addEventListener("iron-overlay-closed", function (e) {
            if (e.target !== e.currentTarget) {
                return;
            }

            let event = e;
            if (event["event"].detail.confirmed) {
                if (channelForm["validate"]()) {
                    channelForm["submit"]();
                } else {
                    channelDialog["open"]();
                }
            }
        });
        channelForm.addEventListener("iron-form-submit", function (e) {
            e.preventDefault();
            let {channelName, service} = channelForm["serialize"]();
            this.login(channelName, service);
            channelForm["reset"]();
        });
    }

    public alert(text: string, timeout?: number, actionText?: string, actionHandler?: Function): void {
        this.snackBar.duration = timeout || UI.DEFAULT_ALERT_TIMEOUT;
        let actionButton = this.snackBar.querySelector("#alertAction");
        (<HTMLElement>actionButton).innerText = actionText;
        actionButton.addEventListener("tap", function () {
            this.snackBar.close();
            actionHandler();
        });
        this.snackBar.text = text;
        this.snackBar.open();
    }

    private loadServices() {
        let select = document.querySelector("#serviceChoice");
        for (let service in ServiceManager.load().services) {
            let option = document.createElement("paper-item");
            option.innerText = service;
            option.dataset["service"] = service;
            select.appendChild(option);
        }
    }
}

export {UI};