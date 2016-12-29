import {ConfigObject, Config} from "../app/config";
const fs = require("fs");

class ConfigJSONObject extends ConfigObject {
    windowWidth?: number;
    windowHeight?: number;
    configDatabase?: string;
}

class ConfigJSON extends Config {
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
        if (filePath !== undefined && filePath !== null)
            if (fs.existsSync(filePath)) {
                this.config = JSON.parse(fs.readFileSync(filePath, "utf-8").toString());
                this.filePath = filePath;
            } else {
                this.save();
            }
    }
}

module.exports = ConfigJSON;