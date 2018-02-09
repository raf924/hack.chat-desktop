import {Channel} from "../channel";
import {Favourite} from "./ui-favourites";

export class ChannelTabs extends Polymer.GestureEventListeners(Polymer.Element) {
    channels: Array<Channel>;
    favourites: Array<Favourite>;

    static get is() {
        return "ui-channels";
    }

    static get properties() {
        return {
            "channels": {
                type: Array,
                value() {
                    return [];
                }
            }, "favourites": {
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

    _isFav(item: Favourite) {
        return !!this.favourites.find(function (fav) {
            return fav.name === item.name && fav.service === item.service;
        });
    }

    addChannel(channel: Channel) {
        this.push("channels", channel);
    }

    removeChannel(channel: Channel) {
        this.splice("channels", this.channels.indexOf(channel), 1);
    }

    addFavourite(favourite: Favourite) {
        this.push("favourites", favourite);
    }

    removeFavourite(favourite: Favourite) {
        this.splice("favourites", this.favourites.indexOf(favourite), 1);
    }

}

customElements.define(ChannelTabs.is, ChannelTabs);