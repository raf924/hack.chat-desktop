import {View} from "./view";
export class Views {
    message: View;
    channel: View;
    user: View;
    users: View;
    accessLink: View;
    favourite: View;

    constructor() {
        this.message = new View("message");
        this.channel = new View("channel");
        this.users = new View("users");
        this.user = new View("user");
        this.accessLink = new View("accessLink");
        this.favourite = new View("favourite");
    }
}