export class Autocomplete {
    get items(): string[] {
        return this._items;
    }

    set items(value: string[]) {
        this._items = value;
    }

    private _items: string[] = [];

    private _root: HTMLInputElement | HTMLTextAreaElement;

    constructor(inputEl: HTMLInputElement | HTMLTextAreaElement) {
        this._root = inputEl;
        let originalString = "";
        let startPos = 0;
        let endPos = 0;
        let nextIndex = 0;
        let possibleItems = [];
        this._root.addEventListener("keyup", (function (e: KeyboardEvent) {
            let target = <HTMLInputElement|HTMLTextAreaElement>e.target;
            if (e.keyCode !== 9 && target.value !== originalString) {
                let beforeWordReg = /(^|\s|@)[\w]*$/ig;
                let match: RegExpExecArray;
                let wordBeginning: number;// = that.data("startPos");
                let items: string[] = this.items;
                possibleItems = items;
                if (target.value.substr(0, target.selectionEnd).length > 0) {
                    while ((match = beforeWordReg.exec(target.value.substr(0, target.selectionEnd))) !== null) {
                        wordBeginning = match.index;
                    }
                    match = /[\w]+/i.exec(target.value.substr(wordBeginning, target.value.length - wordBeginning));
                    if (match !== null) {
                        wordBeginning += match.index;
                        endPos = wordBeginning + match[0].length;
                    } else {
                        endPos = ++wordBeginning;
                    }
                } else {
                    wordBeginning = 0;
                    endPos = 0;
                }
                startPos = wordBeginning;
                if (match !== undefined && match !== null) {
                    possibleItems = items.filter(function (item) {
                        return match.length > 0 && item.startsWith(match[0]);
                    });
                }
                nextIndex = 0;
                originalString = target.value;
            }
        }).bind(this));
        this._root.addEventListener("keydown", (function (e: KeyboardEvent) {
            let target = <HTMLInputElement|HTMLTextAreaElement>e.target;
            if (e.keyCode === 9) {
                e.preventDefault();
                let items = possibleItems || this.items;
                if (items.length > 0) {
                    let currentIndex = nextIndex;
                    let strBefore = originalString.substr(0, startPos);
                    let strAfter = originalString.substr(endPos + 1);
                    target.value = strBefore + items[currentIndex] + " " + strAfter;
                    if (currentIndex === items.length - 1) {
                        currentIndex = -1;
                    }
                    nextIndex = currentIndex + 1;
                }
            }
        }).bind(this));
    }

    addItem(item: string) {
        this._items.push(item);
    }

    removeItem(item: string) {
        this._items.splice(this._items.indexOf(item), 1);
    }
}