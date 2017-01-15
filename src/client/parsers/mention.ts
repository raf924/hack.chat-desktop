import {Parser} from "../parser"
import {UI} from "../ui";

interface MentionMessage extends ParsedMessage{
    mention: boolean,
    originalText: string
}

class MentionParser implements Parser {
    private mention: boolean;

    getRegex(): RegExp {
        return /(\s+|^|<span>|)(@?)([^\s]+)(<\/span>|\s+|$|)/g;
    }

    parse(message: string): MentionMessage {
        this.mention = false;
        let channel = UI.currentChannelUI.getChannel();
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
                let html = $("<span>").css("color", users[nick] || "#b7ef72").text(`@${nick}`)[0].outerHTML; //TODO: set default highlight color
                message = newMessage.replace(userReg, `$1${html}$3`);
            }
        }
        return {text: message, mention: mention, originalText: message};
    }
}

module.exports = MentionParser;
