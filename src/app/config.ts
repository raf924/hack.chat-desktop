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

interface Config {
    save(): void
    config: ConfigObject
    set(name: string, value: any): void
    get(name: string): any
}
