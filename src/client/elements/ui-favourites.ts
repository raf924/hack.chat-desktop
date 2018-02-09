export interface Favourite {
    name: string,
    service: string
}

export class Favourites extends Polymer.GestureEventListeners(Polymer.Element) {
    private channels: Array<Favourite>;

    constructor() {
        super();
        this.channels = [];
    }

    static get is() {
        return "ui-favourites";
    }

    addFavourite(favourite) {
        this.push("channels", favourite);
    }

    favouriteTapped(e) {
        this.dispatchEvent(new CustomEvent("favourite.tapped", {detail: e.model.item}));
    }

    deleteFavourite(e) {
        this.splice("channels", this.channels.indexOf(e.model.item), 1);
        this.dispatchEvent(new CustomEvent("favourite.remove", {detail: e.model.item}));
    }
}

if (!customElements.get(Favourites.is)) {
    customElements.define(Favourites.is, Favourites);
}
