import {Parser} from "./parser";
import  fs = require('fs');
import {UserData} from "./userData";
import {Channel} from "./channel";
import webpack = require("webpack");
const platformUserDataClass = require('./loadUserData');

export class App {
    public static favourites: string[];
    public static currentChannel_: string;
    public static nick: string;
    public static password: string;
    public static parsers: Parser[];
    public static userData: UserData;
    public static ipc: Electron.IpcRenderer; //TODO: replace by abstract communication class
    public static isCordova: boolean;
    public static isAndroid: boolean;

    static proxy: any;
    private static listeners: any;

    public static set currentChannel(channelId) {
        App.proxy.currentChannel_ = App.currentChannel_ = channelId;
    }

    public static init(): void {
        App.loadProxy();
        App.isCordova = !!window.cordova;
        if (!window.cordova) {
            App.ipc = require('electron').ipcRenderer;
        } else {
            document.addEventListener("deviceready", function () {
                window.cordova.plugins.backgroundMode.setDefaults({text: 'Chatron is running'});
                window.cordova.plugins.backgroundMode.enable();
            });
        }
        App.isAndroid = !!navigator.userAgent.match(/Android/i);
        App.favourites = [];
        App.parsers = [];
        App.userData = new platformUserDataClass();
        App.userData.get("favourites", function (value) {
        }, function (error) {
            for (let prop in UserData.defaultData) {
                App.userData.set(prop, UserData.defaultData[prop]);
            }
        });
        App.userData.get("nickName", function (nick) {
            App.nick = nick;
        });
        App.userData.get("password", function (password) {
            App.password = password;
        });
        App.loadParsers();
    }

    static loadProxy() {
        App.listeners = {};
        App.proxy = new Proxy(App, {
            set: function (obj, prop, value) {
                if (App.listeners[prop]) {
                    App.listeners[prop].forEach(function (listener) {
                        listener(value);
                    });
                }
                return true;
            }
        });
    }

    static addListener(prop: string, handler: (value) => {}) {
        if (!App.listeners[prop]) {
            App.listeners[prop] = [];
        }
        App.listeners[prop].push(handler);
    }

    static parseText(text: string): ParsedMessage {
        let message: ParsedMessage = {text: text};
        App.parsers.forEach(function (parser: Parser) {
            message = parser.parse(message.text);
        });
        return message;
    }

    private static loadParsers(): void {
        let parsers = [];
        if (!App.isCordova) {
            parsers = fs.readdirSync(`${__dirname}/modules/parsers`);
            parsers.forEach(function (file) {
                try {
                    let parser = require(`${__dirname}/modules/parsers/${file}`);
                    App.parsers.push(new parser());
                } catch (e) {
                    console.warn(`./modules/parsers/${file} doesn't contain a Parser`);
                }
            });
        } else {
            let r = require.context(`./modules/parsers`, false, /\.js$/);
            parsers = r.keys();
            for (let parser of parsers) {
                let parserClass = r(parser);
                App.parsers.push(new parserClass());
            }

        }
    }

    static addFavourite(favourite: string) {
        App.favourites.push(favourite);
        App.userData.set("favourites", App.favourites);
    }

    static openChannel(channelName: string, nick: string, password?: string) {
        let channel = new Channel(channelName, nick, password);
        App.currentChannel = channel.channelId;
        return channel;

    }
}
