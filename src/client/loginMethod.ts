export abstract class LoginMethod {
    open(channel, service) {
        this.channel = channel;
        this.service = service;
    };

    abstract close(): void;

    service: string;
    channel: string;
    ondone: (channelName: string, service: string) => void;
    onfail: (channelName: string, service: string, err: Error) => void;
    oncancel: (channelName: string, service: string) => void;
    onsuccess: (channelName: string, service: string, nick: string, password: string, useAlways: boolean) => void;
}