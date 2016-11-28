import {Parser} from "../parser"
import {UI} from "../ui";

class MentionParser implements Parser {
    private mention: boolean;

    getRegex(): RegExp {
        return /(\s*|^)(@?)([^\s]+)(\s*|$)/g;
    }

    get hasMention(): boolean {
        return this.mention;
    }

    parse(message: string): string {
        this.mention = false;
        let channel = UI.getCurrentChannelUI().getChannel();
        let users = channel.users;
        let ownNick = channel.nick.split("#")[0];
        let m;
        let newMessage = message;
        const re = new RegExp(this.getRegex());
        while ((m = re.exec(message)) !== null) {
            let nick = m[3];
            this.mention = this.mention || (nick === ownNick);

            if (users[nick] !== undefined && users.hasOwnProperty(nick)) { //TODO: add condition from config : highlightedMention
                let userReg = new RegExp(`(\\s*|^|<span>)(@?)${nick}(</span>|\\s*|$)`, 'g');
                let html = $("<span>").css("color", users[nick] || "#AAADEF").text(`@${nick}`)[0].outerHTML; //TODO: set default highlight color
                newMessage = newMessage.replace(userReg, `$1${html}$3`);
            }
        }
        return newMessage;
    }
}

module.exports = MentionParser;
