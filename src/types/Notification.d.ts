type NotificationPermission = "default" | "denied" | "granted";

type NotificationDirection = "auto" | "ltr" | "rtl";

interface NotificationPermissionCallback {
    (permission: NotificationPermission): void;
}

interface NotificationOptions {
    dir?: NotificationDirection;
    lang?: string;
    body?: string;
    tag?: string;
    image?: string;
    icon?: string;
    badge?: string;
    sound?: string;
    vibrate?: number | number[],
    timestamp?: number,
    renotify?: boolean;
    silent?: boolean;
    requireInteraction?: boolean;
    data?: any;
    actions?: NotificationAction[]
}

interface NotificationAction {
    action: string;
    title: string;
    icon?: string;
}

declare class Notification extends EventTarget {
    constructor(title: string, options?: NotificationOptions);

    static readonly permission: NotificationPermission;
    static requestPermission(): Promise<NotificationPermission>;
    static requestPermission(deprecatedCallback: (permission: NotificationPermission) => void): void;

    static readonly maxActions: number;

    onclick: EventListenerOrEventListenerObject;
    onerror: EventListenerOrEventListenerObject;

    close(): void;

    readonly title: string;
    readonly dir: NotificationDirection;
    readonly lang: string;
    readonly body: string;
    readonly tag: string;
    readonly image: string;
    readonly icon: string;
    readonly badge: string;
    readonly sound: string;
    readonly vibrate: number[];
    readonly timestamp: number;
    readonly renotify: boolean;
    readonly silent: boolean;
    readonly requireInteraction: boolean;
    readonly data: any;
    readonly actions: NotificationAction[]
}