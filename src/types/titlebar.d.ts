declare interface Titlebar {
    appendTo(el: HTMLElement): Titlebar;
    element: HTMLElement;
    destroy(): void;
    on(event: string, callback: Function): Titlebar;
}