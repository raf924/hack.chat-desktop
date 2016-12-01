(function ($) {
    $.fn.autocomplete = function (method?: string, value?: any) {
        let that: JQuery = this;
        if (this[0].nodeName !== "TEXTAREA" && this[0].nodeName !== "INPUT") {
            throw "autocomplete has to be applied to a <textarea> or <input> element";
        }
        if (arguments.length === 0) {
            if (this.data("autocomplete")) {
                throw "autocomplete has already been applied to the element";
            }
            this.data("autocomplete", true);
            this.data("items", []);
            this.keyup(function (e) {
                if (e.keyCode !== 9 && e.target.value !== that.data("originalString")) {
                    let beforeWordReg = /(^|\s|@)[\w]*$/ig;
                    let match: RegExpExecArray;
                    let wordBeginning: number;// = that.data("startPos");
                    let items: string[] = that.data("items");
                    that.data("possibleItems", items);
                    if (e.target.value.length > 0) {
                        while ((match = beforeWordReg.exec(e.target.value.substr(0, e.target.selectionEnd))) !== null) {
                            wordBeginning = match.index;
                        }
                        match = /[\w]+/i.exec(e.target.value.substr(wordBeginning, e.target.value.length - wordBeginning));
                        if(match !== null){
                            wordBeginning += match.index;
                            that.data("endPos", wordBeginning + match[0].length);
                        } else {
                            that.data("endPos", ++wordBeginning);
                        }
                    } else {
                        wordBeginning = 0;
                        that.data("endPos", 0);
                    }
                    that.data("startPos", wordBeginning);
                    if(match !== undefined && match !== null){
                        let possibleItems = items.filter(function (item) {
                            return match.length > 0 && item.startsWith(match[0]);
                        });
                        that.data("possibleItems", possibleItems);
                    }
                    that.data("nextIndex", 0);
                    that.data("originalString", e.target.value);
                }
            }).keydown(function (e) {
                if (e.keyCode === 9) {
                    e.preventDefault();
                    let startPos = that.data("startPos") || 0;
                    let endPos = that.data("endPos") || 0;
                    let currentIndex = that.data("nextIndex") || 0;
                    let items = that.data("possibleItems") || that.data("items");
                    let originalString = that.data("originalString") || "";
                    let strBefore = originalString.substr(0, startPos);
                    let strAfter = originalString.substr(endPos + 1);
                    e.target.value = strBefore + items[currentIndex] + " " + strAfter;
                    if (currentIndex === items.length - 1) {
                        currentIndex = -1;
                    }
                    that.data("nextIndex", currentIndex + 1);
                }
            });
        } else {
            if (!this.data("autocomplete")) {
                this.autocomplete();
            }
            let items: string[];
            switch (method) {
                case "addItem":
                    let newItem = value;
                    items = this.data("items");
                    items.push(newItem);
                    this.data("items", items);
                    break;
                case "removeItem":
                    let oldItem = value;
                    items = this.data("items");
                    let index = items.indexOf(oldItem);
                    items.splice(index, 1);
                    this.data("items", items);
                    break;
                case "setItems":
                    items = value;
                    this.data("items", items);
                    break;
            }
        }
        return this;
    };
})(jQuery);
