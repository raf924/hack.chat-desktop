import {Tool, ToolType} from "../../tool";
import {UI} from "../../ui";
import {App} from "../../app";
export class UserList extends Tool {
    root: HTMLElement;
    menu: HTMLElement;
    userList: HTMLUListElement;

    constructor() {
        super();
        let html = "";
        if (!App.isCordova) {
            html = require("fs").readFileSync(`${__filename.replace(/\.js$/i, ".html")}`).toString();
            let link = document.createElement("link");
            link.href = `${__filename.replace(/\.js$/i, ".css")}`;
            link.rel = "stylesheet";
            document.head.appendChild(link);
        } else {
            //TODO: use webpack html-loader
        }
        UI.toolBar.find("#toolbar").append(html);
        this.root = UI.toolBar.find(`#toolbar #userList`)[0];
        this.menu = <HTMLElement>this.root.querySelector(".mdc-simple-menu");
        this.userList = <HTMLUListElement>this.menu.querySelector(".mdc-list");
        let closeMenu = (function (e) {
            if (!e.target.classList.contains("user") && e.target.id !== "userListOpen") {
                this.menu.classList.remove("mdc-simple-men--open");
                this.userList.innerHTML = "";
                document.removeEventListener("click", closeMenu);
            }
        }).bind(this);
        (<HTMLElement>this.root.querySelector("#userListOpen")).addEventListener("click", (function () {
            this.menu.classList.add("mdc-simple-menu--open");
            this.userList.innerHTML = "";
            if (App.currentChannel) {
                let users = UI.currentChannelUI.channel.users;
                this.userList.innerHTML = "";
                for (let user in users) {
                    let userElement = document.createElement("li");
                    this.userList.appendChild(userElement);
                    userElement.outerHTML = this.root.querySelector("#userTemplate").innerHTML.trim();
                    userElement = this.userList.lastElementChild;
                    userElement.querySelector(".nick").textContent = user;
                    userElement.querySelector(".trip").textContent = users[user];
                    userElement.dataset["nick"] = user;
                    userElement.dataset["trip"] = users[user];
                }
                document.addEventListener("click", closeMenu);
            }
        }).bind(this));
        this.userList.addEventListener("click", (function (e) {
            if ((e.target.classList.contains("user") || e.target.parentElement.classList.contains("user"))) {
                UI.insertAtCursor(`@${e.target.dataset["nick"] || e.target.parentElement.dataset["nick"]} `);
            }
        }).bind(this));
    }
}

export let toolName = UserList.name;
