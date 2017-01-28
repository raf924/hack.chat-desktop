import {UI} from "./ui";
import {App} from "./app";

enum ToolType{
    Menu, SubMenu
}

export abstract class Tool {
    private root: HTMLElement;
    private type: ToolType;
    install(){
        switch (this.type){
            case ToolType.Menu:
                let html = "";
                if(!App.isCordova){
                    html = require("fs").readFileSync(`${__filename.replace(/\.js$/i, ".html")}`);
                } else {
                    //TODO: use webpack html-loader
                }
                UI.toolBar.append(html);
                break;
            case ToolType.SubMenu:
                break;
            default:
                console.error("ToolType unknown");
                throw new Error("ToolType unknown");
        }

    }
}
