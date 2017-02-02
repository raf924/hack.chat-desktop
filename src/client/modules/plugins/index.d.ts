interface JQuery {
    tabs(method: string, data: number|Object): JQuery;
    visibleHeight(): number;
    autocomplete(method? : string, value?: any): JQuery;
}

declare let JQuery: JQuery;