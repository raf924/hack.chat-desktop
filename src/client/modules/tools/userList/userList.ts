import {Tool, ToolType} from "../../../tool";
import {UI} from "../../../ui";
import {App} from "../../../app";
export class UserList extends Tool {
    root: any | HTMLElement;
    menu: any | HTMLElement;
    userList: any | HTMLElement;

    constructor() {
        super();
        let html = "";
        let link = document.createElement("link");
        if (!App.isCordova) {
            html = require("fs").readFileSync(`${__filename.replace(/\.js$/i, ".html")}`).toString();
            link.href = `${__filename.replace(/\.js$/i, ".css")}`;

        } else {
            html = require(`html-loader!${__filename.replace(/\.js$/i, ".html")}`);
            link.href = require(`file-loader?name=[name].[ext]&publicPath=tools/&outputPath=tools/!${__filename.replace(/\.js$/i, ".css")}`);
        }
        link.rel = "stylesheet";
        document.head.appendChild(link);
        let tmpElement = document.createElement("div");
        UI.toolBar.querySelector("#toolbar").appendChild(tmpElement);
        tmpElement.outerHTML = html;
        this.root = UI.toolBar.querySelector(`#toolbar #userList`);
        this.root.style.display = "none";
        this.menu = this.root.querySelector("paper-menu");
        this.userList = this.root.querySelector("#list");
        (<HTMLElement>this.root.querySelector("paper-icon-button")).addEventListener("click", (function () {
            //TODO: erase all children
            if (App.currentChannel_) {
                let users = UI.currentChannelUI.channel.users;
                this.userList.innerHTML = "";
                for (let user in users) {
                    let userElement = document.createElement("paper-item");
                    this.userList.appendChild(userElement);
                    userElement.outerHTML = this.root.querySelector("#userTemplate").innerHTML.trim();
                    userElement = this.userList.lastElementChild;
                    userElement.querySelector(".nick").textContent = user;
                    userElement.querySelector(".trip").textContent = users[user];
                    userElement.dataset["nick"] = user;
                    userElement.dataset["trip"] = users[user];
                }
            }
        }).bind(this));
        this.userList.addEventListener("tap", (function (e) {
            if ((e.target.classList.contains("user") || e.target.parentElement.classList.contains("user"))) {
                UI.insertAtCursor(`@${e.target.dataset["nick"] || e.target.parentElement.dataset["nick"]} `);
            }
        }).bind(this));
        App.addListener("currentChannel_", (function (currentChannel) {
            if (currentChannel === null) {
                this.root.style.display = "none";
            } else {
                this.root.style.display = "";
            }
        }).bind(this));
    }
}

export let toolName = UserList.name;
