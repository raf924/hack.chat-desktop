import {UI} from "./ui";
import {App} from "./app";

export enum ToolType{
    Menu, SubMenu
}

export abstract class Tool {
    public type: ToolType;
}
