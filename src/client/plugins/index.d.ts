interface JQuery {
    tabs(method: string, data: number|Object): JQuery;
    modal(): JQuery;
    modal(method: string): void;
    visibleHeight(): number;
    mixedLogin(): JQuery;
    autocomplete(method? : string, value?: any): JQuery;
}

declare let JQuery: JQuery;