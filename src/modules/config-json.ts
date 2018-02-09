import {ConfigObject, Config} from "../app/config";
const fs = require("fs");
const path = require("path");

class ConfigJSONObject extends ConfigObject {
    windowWidth?: number;
    windowHeight?: number;
    configDatabase?: string;
}

export class ConfigJSON extends Config {
    readonly config: ConfigJSONObject;
    readonly filePath: string;

    save(): void {
        fs.writeFileSync(this.filePath, JSON.stringify(this.config));
    }

    set(name: string, value: any): void {
        if (this.config.hasOwnProperty(name)) {
            this.config[name] = value;
        }
    }

    get(name: string): any {
        return this.config[name];
    }

    constructor(filePath: string) {
        super();
        this.config = new ConfigJSONObject();
        filePath = path.resolve(filePath);
        if (filePath !== undefined && filePath !== null) {
            this.filePath = filePath;
            if (fs.existsSync(filePath)) {
                this.config = JSON.parse(fs.readFileSync(filePath, "utf-8").toString());

            } else {
                this.save();
            }
        }
    }
}