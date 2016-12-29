export interface Property {
    name: string;
    value: string;
}

export class ConfigObject {
    favourites: string[];
    openInside: boolean;

    constructor() {
        this.favourites = ["programming"];
        this.openInside = false;
    }
}

export abstract class Config {
    protected config: ConfigObject;
    abstract save(): void
    set(name: string, value: any): void {
        this.config[name] = value;
    }

    get(name: string): any {
        return this.config[name];
    }
}
