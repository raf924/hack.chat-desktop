
import {Parser} from "./parser";
class LinkParser extends Parser{
    parse(text: string): string {
        let matches = text.match(/((http(|s):\/\/.+(|[\s]))|(\?[^\s]+))/gi); //TODO: ?\ntext makes a link we don't want that
        if (matches !== null) {
            matches.forEach(function(link : string) {
                text = text.replace(link.trim(), `<a href='${link.trim()}' target='_blank'>${link.trim()}</a>`);
            });
        }
        return text;
    }
}

export {LinkParser}