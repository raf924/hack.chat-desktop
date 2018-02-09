declare interface TitleBar {

    appendTo(el: HTMLElement): TitleBar;

    element: HTMLElement;

    destroy(): void;

    on(event: string, callback: Function): TitleBar;
}
