abstract class Parser{
    abstract getRegex() : RegExp
    abstract parse(text : string): ParsedMessage
}

export {Parser}