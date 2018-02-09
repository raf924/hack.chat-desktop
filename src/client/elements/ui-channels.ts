import {Channel} from "../channel";
import {ChannelUI} from "./ui-channel";

export class UIChannels extends Polymer.GestureEventListeners(Polymer.Element) {
    channels: Channel[];

    static get is() {
        return "ui-channels";
    }

    static get properties() {
        return {
            channels: {
                type: Array,
                value() {
                    return [];
                }
            }
        }
    }

    constructor() {
        super();
    }

    ready() {
        super.ready();
    }

    public setActive(channelId) {
        this.channels.forEach(function (channel) {
            channel.active = channel.channelId === channelId;
        });
    }

    public get currentChannel() {
        return this.channels.find(function (channel) {
            return channel.active;
        });
    }

    public get currentChannelUI() {
        return Array.from(this.querySelectorAll("ui-channel")).find(function (channelUI: ChannelUI) {
            return channelUI.channel.active;
        });
    }

    public addChannel(channel) {
        this.push("channels", channel);
    }

    public closeChannel(channelId: string) {
        let channelIndex = this.channels.findIndex(function (channel) {
            return channel.channelId === channelId;
        });
        this.channels[channelIndex].close();
        this.splice("channels", channelIndex, 1);
    }
}