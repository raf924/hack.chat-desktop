//import {LoginMethod} from "../../../loginMethod";

import {LoginMethod} from "../../../loginMethod";

class LoginMixed extends LoginMethod {
    selectionStart: number = 0;
    selectionEnd: number = 0;
    keyPressedDown: boolean = false;
    realNick: string;
    target: HTMLInputElement;

    static get is() {
        return "login-mixed";
    }

    static get properties() {
        return {
            target: {
                type: Object
            },
            realNick: {
                type: String,
                value: ""
            },
            displayNick: {
                type: String,
                computed: "_displayValue(realNick)"
            }
        }
    }

    constructor() {
        super();
        this.selectionStart = 0;
        this.selectionEnd = 0;
    }

    ready() {
        super.ready();
        this.target = this.$.input;
        this.target.addEventListener("textInput", this.keyInput);
    }

    _displayValue(realValue) {
        let [userName, password] = realValue.split("#");
        if (password) {
            password = `#${password.replace(/./, "*")}`;
        }
        return `${userName}${password}`;
    }

    keyInput(e) {
        if (e.type === "keydown") {
            this.selectionStart = e.currentTarget.selectionStart;
            this.selectionEnd = e.currentTarget.selectionEnd;
        }
        this.keyPressedDown = true;
        let target = this.$.input.$.nativeInput;
        let before;
        let after;
        let key = e.key || e.data;
        switch (key) {
            case "Backspace":
            case "Delete":
                this.applyComposition(key, target.selectionStart, target.selectionEnd);
                break;
            default:
                if (key.length === 1) {
                    e.preventDefault();
                    before = this.realNick.substring(0, target.selectionStart);
                    after = this.realNick.substring(target.selectionEnd);
                    this.realNick = before + key + after;
                    let matches = this.realNick.split("#");
                    let oldSelectionStart = target.selectionStart;
                    this.$.input.value = matches.length < 2 ? this.realNick : this.realNick.replace(/#(.+)/, `#${matches[1].replace(/./g, "*")}`);
                    target.selectionStart = oldSelectionStart + 1;
                    target.selectionEnd = oldSelectionStart + 1;
                }
                break;
        }
    }

    open(channel, service) {
        this.channel = channel;
        this.service = service;
        this.$.dialog.open();
        let that = this;
        window.setTimeout(function () {
            that.$.input.focus();
        }, 100);
    }

    close() {
        this.$.dialog.close();
        this.$.input.value = "";
    }

    cancel() {
        this.realNick = "";
        if (typeof this.oncancel === "function") {
            this.oncancel(this.channel, this.service);
        }
        if (typeof this.ondone === "function") {
            this.ondone(this.channel, this.service);
        }
    }

    confirm() {
        let useAlways: boolean = (<HTMLInputElement>this.root.querySelector("#useAlways")).checked;
        let [nick, password] = this.realNick.split("#");
        if (typeof this.onsuccess === "function") {
            this.onsuccess(this.channel, this.service, nick, password, useAlways);
        }
        if (typeof this.ondone === "function") {
            this.ondone(this.channel, this.service);
        }
        this.realNick = "";
    }

    delete() {

    }

    remove() {
        console.log("Backspace");
    }

    keyProcess(ev) {
        console.log(ev);
        let key = null;
        let target = this.$.input.$.nativeInput;
        if (target.value.length === 0) {
            this.realNick = "";
        }
        else if (!this.keyPressedDown && target.value.length < this.realNick.length && navigator.userAgent.match(/Android/i)) {
            if (this.selectionStart === target.selectionStart) {
                key = "Delete";
            } else if (this.selectionStart > target.selectionStart) {
                key = "Backspace";
            }
            this.applyComposition(key, this.selectionStart, this.selectionEnd);
        }
        this.keyPressedDown = false;
    }

    applyComposition(key, selectionStart, selectionEnd) {
        let before;
        let after;
        switch (key) {
            case "Backspace":
                before = this.realNick.substring(0, selectionStart - 1);
                after = this.realNick.substring(selectionEnd);
                this.realNick = before + after;
                break;
            case "Delete":
                before = this.realNick.substring(0, selectionStart);
                if (selectionStart === selectionEnd) {
                    selectionEnd++;
                }
                after = this.realNick.substring(selectionEnd);
                this.realNick = before + after;
                break;
        }
    }
}

export default function () {
    let link = document.createElement("link");
    link.rel = "import";
    link.href = require("file-loader?name=[name].[ext]&publicPath=./&outputPath=./lib/client/modules/login/mixedLogin/!./mixedLogin.html");
    document.head.appendChild(link);
    return new Promise(function (resolve) {
        link.onload = function () {
            customElements.define(LoginMixed.is, LoginMixed);
            let element = document.createElement(LoginMixed.is);
            document.body.appendChild(element);
            resolve(element);
        };
    });
}


/*
export default class MixedLoginPopup extends LoginMethod {
    root: HTMLElement;
    input: HTMLInputElement;
    realNick = "";
    keyPressedDown = false;
    private confirmButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;
    private loginForm: HTMLFormElement;

    constructor() {
        super();
        let path = require(`file-loader?name=[name].[ext]&publicPath=./&outputPath=lib/client/modules/login/html/!${__filename.replace(/\.ts$/i, ".html")}`);
        let importLink = Polymer.Base.importHref(path, () => {
        });
        importLink.onload = (function () {
            this.root = importLink.import.body.firstChild;
            document.body.appendChild(this.root);
            this.input = this.root.querySelector("#nickInput");
            this.confirmButton = this.root.querySelector(".confirm");
            this.cancelButton = this.root.querySelector(".cancel");
            this.loginForm = Polymer.dom(this.root).querySelector("form");
            this.loginForm.addEventListener("reset", (function (ev) {
                this.realNick = "";
                if (typeof this.oncancel === "function") {
                    this.oncancel(this.channel, this.service);
                }
                if (typeof this.ondone === "function") {
                    this.ondone(this.channel, this.service);
                }
            }).bind(this));
            this.loginForm.addEventListener("iron-form-submit", (function (ev) {
                ev.preventDefault();
                let useAlways: boolean = (<HTMLInputElement>this.root.querySelector("#useAlways")).checked;
                let [nick, password] = this.realNick.split("#");
                if (typeof this.onsuccess === "function") {
                    this.onsuccess(this.channel, this.service, nick, password, useAlways);
                }
                if (typeof this.ondone === "function") {
                    this.ondone(this.channel, this.service);
                }
                this.realNick = "";
            }).bind(this));
            this.root.addEventListener("iron-overlay-closed", (function (e) {
                if (e.detail.confirmed) {
                    this.loginForm.submit();
                } else {
                    this.loginForm.reset();
                }
            }).bind(this));
            let selectionStart = 0;
            let selectionEnd = 0;
            this.input.addEventListener("textInput", this.keyInput.bind(this));
            this.input.addEventListener("keydown", this.keyInput.bind(this));
            this.input.addEventListener("keydown", function (e) {
                selectionStart = (<HTMLInputElement>e.currentTarget).selectionStart;
                selectionEnd = (<HTMLInputElement>e.currentTarget).selectionEnd;
            });
            this.input.addEventListener("keyup", (function (ev) {
                let key: string = null;
                let target = <HTMLInputElement>ev.currentTarget;
                if (target.value.length === 0) {
                    this.realNick = "";
                }
                else if (!this.keyPressedDown && target.value.length < this.realNick.length && navigator.userAgent.match(/Android/i)) {
                    if (selectionStart === target.selectionStart) {
                        key = "Delete";
                    } else if (selectionStart > target.selectionStart) {
                        key = "Backspace";
                    }
                    this.applyComposition(key, selectionStart, selectionEnd);
                }
                this.keyPressedDown = false;
            }).bind(this));
        }).bind(this);
    }

    open(channel, service): void {
        super.open(channel, service);
        (<any>this.root).open();
        let that = this;
        window.setTimeout(function () {
            that.input.focus();
        }, 100);
    }

    close(): void {
        (<any>this.root).close();
        this.input.value = "";
    }

    private keyInput(event) {
        this.keyPressedDown = true;
        let target: HTMLInputElement = <HTMLInputElement> event.target.$.input;
        let before;
        let after;
        let key = event.key || event.data;
        switch (key) {
            case "Backspace":
            case "Delete":
                this.applyComposition(key, target.selectionStart, target.selectionEnd);
                break;
            case "Enter":
                this.confirmButton.click();
                break;
            default:
                if (key.length === 1) {
                    event.preventDefault();
                    before = this.realNick.substring(0, target.selectionStart);
                    after = this.realNick.substring(target.selectionEnd);
                    this.realNick = before + key + after;
                    let matches = this.realNick.split("#");
                    let oldSelectionStart = event.currentTarget.selectionStart;
                    event.currentTarget.value = matches.length < 2 ? this.realNick : this.realNick.replace(/#(.+)/, `#${matches[1].replace(/./g, "*")}`);
                    event.currentTarget.selectionStart = oldSelectionStart + 1;
                    event.currentTarget.selectionEnd = oldSelectionStart + 1;
                }
                break;
        }
    }

    private applyComposition(key: string, selectionStart: number, selectionEnd: number) {
        let before: string;
        let after: string;
        switch (key) {
            case "Backspace":
                before = this.realNick.substring(0, selectionStart - 1);
                after = this.realNick.substring(selectionEnd);
                this.realNick = before + after;
                break;
            case "Delete":
                before = this.realNick.substring(0, selectionStart);
                if (selectionStart === selectionEnd) {
                    selectionEnd++;
                }
                after = this.realNick.substring(selectionEnd);
                this.realNick = before + after;
                break;
        }
    }

}*/