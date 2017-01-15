
import {Parser} from "../parser";
class LinkParser extends Parser{
    getRegex(): RegExp {
        return /(\s|^)((http(|s):\/\/)|\?)[^\s]+/gi;
    }
    parse(text: string): ParsedMessage {
        let matches = text.match(this.getRegex()); //TODO: ?\ntext makes a link we don't want that
        if (matches !== null) {
            matches.forEach(function(link : string) {
                text = text.replace(link.trim(), `<a href='${link.trim()}' target='_blank'>${link.trim()}</a>`);
            });
        }
        return {text};
    }
}

module.exports = LinkParser;