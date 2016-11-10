abstract class Parser{
    abstract getRegex() : RegExp
    abstract parse(text : string): string
}

export {Parser}