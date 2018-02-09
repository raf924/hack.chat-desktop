import {Parser} from "../../parser"
import {UI} from "../../ui";
import {App} from "../../app";

interface MentionMessage extends ParsedMessage {
    mention: boolean,
    originalText: string
}

export default class MentionParser implements Parser {
    private mention: boolean;

    getRegex(): RegExp {
        return /(\s+|^|<span>|)(@?)([^\s]+)(<\/span>|\s+|$|)/g;
    }

    parse(message: string): MentionMessage {
        this.mention = false;
        let channel = App.load().currentChannel;
        let users = channel.users;
        let ownNick = channel.nick.split("#")[0];
        let m;
        let newMessage = message;
        let mention = false;
        const re = new RegExp(this.getRegex());
        while ((m = re.exec(message)) !== null) {
            let nick = m[3];
            mention = mention || (nick === ownNick);

            if (users[nick] !== undefined && users.hasOwnProperty(nick)) { //TODO: add condition from config : highlightedMention
                let userReg = new RegExp(`(\\s+|^|<span>)(@)${nick}(</span>|\\s+|$)`, 'g');
                let element = document.createElement("span");
                element.style.color = "#b7ef72"; //TODO: set default highlight color + generate color from trip
                element.innerText = `@${nick}`;
                let html = element.outerHTML;
                message = newMessage.replace(userReg, `$1${html}$3`);
            }
        }
        return {text: message, mention: mention, originalText: newMessage};
    }
}
