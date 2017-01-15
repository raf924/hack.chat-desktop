import {Login} from "../login";

export const className = "MixedLoginPopup";
export class MixedLoginPopup extends Login {
    overlay: HTMLDivElement;
    root: HTMLElement;
    input: HTMLInputElement;
    realNick = "";
    keyPressedDown = false;
    private confirmButton: HTMLButtonElement;
    private cancelButton: HTMLButtonElement;
    private loginForm: HTMLFormElement;

    constructor(root: HTMLElement) {
        super();
        let that = this;
        this.root = root;
        this.input = <HTMLInputElement>root.querySelector("#nickInput");
        this.confirmButton = <HTMLButtonElement>root.querySelector(".confirm");
        this.cancelButton = <HTMLButtonElement>root.querySelector(".cancel");
        this.overlay = document.createElement("div");
        this.overlay.classList.add("overlay");
        this.overlay.setAttribute("for", this.root.id);
        this.loginForm = this.root.querySelector("form");
        this.loginForm.onsubmit = function (ev) {
            ev.preventDefault();
            let useAlways: boolean = (<HTMLInputElement>that.root.querySelector("#useAlways")).checked;
            if (typeof that.onsuccess === "function") {
                that.onsuccess(that.channel, that.service, that.realNick.split("#")[0], that.realNick.split("#")[1], useAlways);
            }
            if (typeof that.ondone === "function") {
                that.ondone(that.channel, that.service);
            }
            that.realNick = "";
        };
        let selectionStart = 0;
        let selectionEnd = 0;
        this.input.addEventListener("textInput", this.keyInput.bind(this));
        this.input.addEventListener("keydown", this.keyInput.bind(this));
        this.input.addEventListener("keydown", function (e) {
            selectionStart = (<HTMLInputElement>e.currentTarget).selectionStart;
            selectionEnd = (<HTMLInputElement>e.currentTarget).selectionEnd;
        });
        this.input.addEventListener("keyup", function (ev) {
            let key: string = null;
            let target = <HTMLInputElement>ev.currentTarget;
            if (target.value.length === 0) {
                that.realNick = "";
            }
            else if (!that.keyPressedDown && target.value.length < that.realNick.length && navigator.userAgent.match(/Android/i)) {
                if (selectionStart === target.selectionStart) {
                    key = "Delete";
                } else if (selectionStart > target.selectionStart) {
                    key = "Backspace";
                }
                that.applyComposition(key, selectionStart, selectionEnd);
            }
            that.keyPressedDown = false;
        });
        this.loginForm.addEventListener("reset", function () {
            that.realNick = "";
            if (typeof that.oncancel === "function") {
                that.oncancel(that.channel, that.service);
            }
            if (typeof that.ondone === "function") {
                that.ondone(that.channel, that.service);
            }
        });
        (<HTMLInputElement>this.root.querySelector("#useAlways")).onfocus = function (ev) {
            (<HTMLElement>ev.target).blur();
        }
    }

    open(channel, service): void {
        super.open(channel, service);
        document.body.appendChild(this.overlay);
        this.root.classList.add("open");
        let that = this;
        window.setTimeout(function () {
            that.input.focus();
        }, 100);
        document.addEventListener("keyup", (function (e) {
            if (e.key === "Escape") {
                this.loginForm.reset();
            }
        }).bind(this));
    }

    close(): void {
        document.body.removeChild(this.overlay);
        this.input.value = "";
        this.root.classList.remove("open");
        document.removeEventListener("keyup", (function (e) {
            if (e.key === "Escape") {
                this.loginForm.reset();
            }
        }).bind(this));
    }

    private keyInput(event) {
        this.keyPressedDown = true;
        let target: HTMLInputElement = <HTMLInputElement> event.currentTarget;
        let before;
        let after;
        let key = event.key || event.originalEvent.data;
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