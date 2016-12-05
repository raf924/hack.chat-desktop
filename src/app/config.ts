class ConfigObject {
    nickName: string;
    favourites: string[];
    openInside: boolean;

    constructor() {
        this.nickName = "";
        this.favourites = ["programming"];
        this.openInside = false;
    }
}

abstract class Config {
    protected config: ConfigObject;
    abstract save(): void
    set(name: string, value: any): void {
        this.config[name] = value;
    }

    get(name: string): any {
        return this.config[name];
    }
}
