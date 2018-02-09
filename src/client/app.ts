///<reference path="../../node_modules/electron/electron.d.ts"/>
///<reference path="../types/Polymer.d.ts"/>
import {Parser} from "./parser";
import {UserData} from "./userData";
import * as platformUserDataClass from './loadUserData';
import {UI} from "./ui";
import {Channel} from "./channel";
import {Favourite} from "./elements/ui-favourites";
import {ServiceManager} from "./serviceManager";

export class App extends Polymer.PropertyEffects(Object) {
    public favourites: Favourite[];
    public channels: Channel[];
    public currentChannel_: string;
    public currentChannel: Channel;
    public nick: string;
    public password: string;
    public parsers: Parser[];
    public userData: UserData;
    public ipc: Electron.IpcRenderer; //TODO: replace by abstract communication class
    public static instance: App;
    public proxy: any;
    private listeners: Map<string, Array<Function>>;
    private ui: UI = UI.load();

    static get properties() {
        return {
            favourites: {
                type: Array,
                value() {
                    return [];
                }
            },
            channels: {
                type: Array,
                value() {
                    return [];
                }
            }, currentChannel: {
                type: Channel,
                observer: "currentChannelChanged"
            }
        }
    };

    public static get isElectron() {
        return !!navigator.userAgent.match(/Electron/i);
    }

    public static get isAndroid() {
        return !!navigator.userAgent.match(/Android/i);
    }

    /*public set currentChannel(channelId) {
        this.proxy.currentChannel_ = this.currentChannel_ = channelId;
    }*/

    constructor() {
        super();
        this.linkPaths("favourites", "");
        this.loadProxy();
        if (App.isElectron) {
            this.ipc = require('electron').ipcRenderer;
        } else {
            window.cordova.plugins.backgroundMode.setDefaults({text: 'Chatron is running'});
            window.cordova.plugins.backgroundMode.enable();
        }
        this.loadUserData();
        this.loadParsers();
        this.loadEventHandlers();
        this.ui = UI.load();
    }

    public static load(): App {
        if (!App.instance) {
            App.instance = new App();
        }
        return App.instance;
    }

    loadUserData() {
        this.favourites = [];
        this.userData = new platformUserDataClass.default();
        this.userData.get("favourites", function (value) {
        }, function (error) {
            for (let prop in UserData.defaultData) {
                this.userData.set(prop, UserData.defaultData[prop]);
            }
        }.bind(this));
        this.userData.get("nickName", function (nick) {
            this.nick = nick;
        });
        this.userData.get("password", function (password) {
            this.password = password;
        }.bind(this));
    }

    loadProxy() {
        this.listeners = new Map();
        this.proxy = new Proxy(App, {
            set: function (obj, prop, value) {
                if (this.listeners[prop]) {
                    this.listeners[prop].forEach(function (listener) {
                        listener(value);
                    });
                }
                return true;
            }
        });
    }

    private loadLoginEvents(): void {
        this.userData.get("loginMethod", async function (loginMethod) {
            let method = require(`${__dirname}/modules/login/${loginMethod}/${loginMethod}`);
            this.loginMethod = await method.default();
            this.loginMethod.onsuccess = (channelName, service, nick, password, useAlways) => {
                if (App.isElectron) {
                    this.ipc.send("join", JSON.stringify({
                        "channel": channelName,
                        "service": service,
                        "nick": nick,
                        "password": password
                    }));
                } else {
                    this.login(channelName, service, nick, password);
                }
                if (useAlways) {
                    this.userData.set("nickName", nick);
                    this.userData.set("password", password);
                    this.nick = nick;
                    this.password = password;
                }
                this.loginMethod.close();
            };
            this.loginMethod.oncancel = () => {
                this.loginMethod.close();
            }
        }.bind(this));
    }

    addListener(prop: string, handler: (value) => {}) {
        if (!this.listeners[prop]) {
            this.listeners[prop] = [];
        }
        this.listeners[prop].push(handler);
    }

    parseText(text: string): ParsedMessage {
        let message: ParsedMessage = {text: text};
        this.parsers.forEach(function (parser: Parser) {
            message = parser.parse(message.text);
        });
        return message;
    }

    loadParsers(): void {
        this.parsers = [];
        let r = require.context(`./modules/parsers`, false, /\.ts$/);
        let parsers = r.keys();
        for (let parser of parsers) {
            let parserClass = r(parser).default;
            this.parsers.push(new parserClass());
        }
    }

    addFavourite(favourite: Favourite) {
        this.push("favourites", favourite);
        this.userData.set("favourites", this.favourites);
    }

    openChannel(service: string, channelName: string, nick: string, password ?: string) {
        let serviceConstructor = ServiceManager.load().services[service];
        let channel: Channel = new serviceConstructor(channelName, nick, password);
        channel.connect();
        this.push("channels", channel);
        this.currentChannel = channel;
        return channel;
    }

    private loadEventHandlers() {
        document.addEventListener("disconnect", this.disconnect);
        document.addEventListener("close", this.close);
        document.addEventListener("changeChannel", this.changeChannel);
        document.addEventListener("newChannel", this.newChannel);
    }

    private disconnect(e: CustomEvent) {
        let {channel, reason, reconnectTimeout} = e.detail;
        this.ui.alert(`${channel.name}@${channel.service} was disconnected\nReason: ${reason}\nRetrying`,
            UI.DEFAULT_ALERT_TIMEOUT,
            "Cancel",
            () => {
                window.clearTimeout(reconnectTimeout);
                this.splice("channels", this.channels.indexOf(channel), 1);
                this.notifyPath("channels");
            });
    }

    private close(e: CustomEvent) {
        let {channel} = e.detail;
        this.splice("channels", this.channels.indexOf(channel), 1);
        this.notifyPath("channels");
    }

    private changeChannel(e: CustomEvent) {
        let channel: Channel = this.channels.find(function (channel: Channel) {
            return channel.channelId == e.detail.channelId;
        });
        channel.active = true;
    }

    private newChannel(e: CustomEvent) {
        let {service, name, nick, password, reconnect} = e.detail;
        let currentChannel: Channel = this.currentChannel;
        this.openChannel(service, name, nick, password);
        if (reconnect) {
            this.currentChannel = currentChannel;
        }
    }

    private currentChannelChanged(currentChannel: Channel, previousChannel: Channel) {
        previousChannel.active = false;
        currentChannel.active = true;
    }

    attributeChangedCallback(name: string, old: any, value: any) {
        super.attributeChangedCallback(name, old, value);
        console.log(name, old, value);
    }
}
