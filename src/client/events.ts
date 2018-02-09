import {Channel} from "./channel";

class ChatronEvent extends CustomEvent {
    static readonly type: string;

    constructor(eventConfig: any) {
        if (!ChatronEvent.type) {
            throw "The event doesn't have a type";
        }
        super(ChatronEvent.type, {detail: eventConfig});

    }
}

export class TestEvent extends ChatronEvent {
    static type = "test";

    constructor(message: string) {
        super({message});
    }
}

export class MentionEvent extends ChatronEvent {
    static type = "mention";

    constructor(channel: Channel, nick: string) {
        super({channel, nick});
    }
}

export class AlertEvent extends ChatronEvent {
    static type = "alert";

    constructor(text: string, timeout?: number, actionText?: string, actionHandler?: Function) {
        super({
            text, timeout, actionText, actionHandler
        });
    }
}

const events = {
    mention: MentionEvent,
    alert: AlertEvent,

};

window.notify = function (event: string, ...args) {
    document.dispatchEvent(new events[event](args));
};

document.addEventListener(TestEvent.type, function (e: CustomEvent) {
   console.log(e.detail);
});