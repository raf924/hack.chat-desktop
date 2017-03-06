import {LoginMethod} from "../../../loginMethod";
import {App} from "../../../app";

export const className = "MixedLoginPopup";
export class MixedLoginPopup extends LoginMethod {
    root: HTMLElement;
    input: HTMLInputElement;
    realNick = "";
    keyPressedDown = false;
    private confirmButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;
    private loginForm: HTMLFormElement;

    constructor() {
        super();
        let path = `${__dirname}/mixedLogin.html`;
        if(App.isCordova){
            path = require(`file-loader?name=[name].[ext]&publicPath=login/&outputPath=login/!${__filename.replace(/\.js$/i, ".html")}`);
        }
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
                let event = Polymer.dom(e);
                if (event.event.detail.confirmed) {
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

}