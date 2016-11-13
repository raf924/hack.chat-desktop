import {Parser} from "../parser"
import {isNullOrUndefined} from "util";
import {UI} from "../ui";

class MentionParser implements Parser{
    getRegex() : RegExp{
        return /(\s*|^)(@?)([^\s]+)(\s*|$)/g;
    }
    parse(message: string): string {
        let channel =  UI.getCurrentChannelUI().getChannel();
        let users = channel.users;
        let ownNick = channel.nick.split("#")[0];
        let m;
        let newMessage = message;
        const re = new RegExp(this.getRegex());
        while ((m = re.exec(message)) !== null) {
            let nick = m[3];
            if(nick === ownNick){
                newMessage = `<span class="mention">${newMessage}</span>`;
            }

            if(!isNullOrUndefined(users[nick])){ //TODO: add condition from config : highlightedMention
                let userReg = new RegExp(`(\\s*|^|<span>)(@?)${nick}(</span>|\\s*|$)`,'g');
                newMessage = newMessage.replace(userReg, `$1<span style="color: ${users[nick]||"#ABCDEF"};">@${nick}</span>$3`);
            }
        }
        return newMessage;
    }
}

module.exports = MentionParser;