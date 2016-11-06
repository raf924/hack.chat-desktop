interface JQuery {
    tabs(method: string, data: number|Object): JQuery;
    modal(): JQuery;
    modal(method: string): void;
}

declare var JQuery: JQuery;