const fs = require("fs");

class ConfigJSONObject extends ConfigObject {
    windowWidth?: number;
    windowHeight?: number;
    configDatabase?: string;
}

class ConfigJSON implements Config {
    readonly config: ConfigJSONObject;
    readonly filePath: string;

    save(): void {
        fs.writeFileSync(this.filePath, JSON.stringify(this.config));
    }

    set(name: string, value: any): void {
    }

    get(name: string): any {
        return undefined;
    }

    constructor(filePath: string) {
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