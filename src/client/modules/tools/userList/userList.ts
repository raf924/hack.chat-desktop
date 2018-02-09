import {Listener, Tool, ToolType} from "../../../tool";
import {UI} from "../../../ui";
import {App} from "../../../app";
import {MentionEvent} from "../../../events";

export default class ToolUserList extends Tool {
    //TODO: use App::addListener
    get listeners(): Array<Listener> {
        return [
            {
                property: "currentChannel_",
                callback: (function (currentChannel) {
                    if (currentChannel === null) {
                        this.root.style.display = "none";
                    } else {
                        this.root.style.display = "";
                    }
                    this.loadList();
                }).bind(this)
            }
        ];
    }

    static get is() {
        return "tool-userlist";
    }

    constructor() {
        super();
    }

    static get properties() {
        return {
            users: {
                type: Array,
                value() {
                    return [];
                }
            }
        };
    }

    ready() {
        super.ready();
        require(`style-loader!${__filename.replace(/\.ts$/i, ".less")}`)(this.root);
    }

    loadList() {
        //TODO: erase all children
        if (App.load().currentChannel) {
            this.set("users", App.load().currentChannel.users);
        }
    }

    mention(e) {
        UI.load().insertAtCursor(`@${e.model.item.nick} `);
        document.dispatchEvent(new MentionEvent(App.load().currentChannel, e.model.item.nick));
    }

    get hasListeners() {
        return true;
    }
}

let link = document.createElement("link");
link.rel = "import";
link.href = require("file-loader?name=[name].[ext]&publicPath=./&outputPath=./lib/client/modules/tools/userList/!./userList.html");
document.head.appendChild(link);
link.onload = function () {
    customElements.define(ToolUserList.is, ToolUserList);
};