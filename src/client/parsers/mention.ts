import {Parser} from "../parser"
import {isUndefined} from "util";
import {isNullOrUndefined} from "util";

class MentionParser implements Parser{
    private users : string[];
    private ownNick : string;
    constructor(userList : string[], ownNick : string){
        this.users = userList;
        this.ownNick = ownNick;
    }
    getRegex() : RegExp{
        return /(\s*|^)(@?)([^\s]+)(\s*|$)/g;
    }
    parse(message: string): string {
        let m;
        while ((m = this.getRegex().exec(message)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === this.getRegex().lastIndex) {
                this.getRegex().lastIndex++;
            }
            let nick = m[3];
            if(nick === this.ownNick){
                message = `<span class="mention">${message}</span>`;
            }

            if(!isNullOrUndefined(this.users[nick])){ //TODO: add condition from config : highlightedMention
                message.replace(this.getRegex(), `$1<span style="color: ${this.users[nick]};">@$3</span>$4`);
            }
        }
        return message;
    }

}
