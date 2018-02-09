import {Parser} from "../../parser";

const toHTML = {
    '\n': "<br>",
    '\t': "&nbsp;&nbsp;&nbsp;&nbsp;",
    ' ': "&nbsp;",
};

export default class WhiteSpaceParser extends Parser {
    getRegex(): RegExp {
        return /(\t|\n| )/gi;
    }

    parse(text: string): ParsedMessage {
        let newText = text;
        for (let char in toHTML) {
            newText = newText.replace(new RegExp(`${char}(?!(<[^>/]*>|[^><]*>))`, 'gi'), toHTML[char]);
        }
        newText = newText.replace(/\s(?!(<[^>/]*>|[^><]*>))/gi, "&nbsp;");
        return {text: newText};
    }

}