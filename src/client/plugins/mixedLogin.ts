(function ($) {
    function applyComposition(el: HTMLInputElement, nick: string, key: string, selectionStart: number, selectionEnd: number) {
        let before: string;
        let after: string;
        switch (key) {
            case "Backspace":
                before = nick.substring(0, selectionStart - 1);
                after = nick.substring(selectionEnd);
                return before + after;
            case "Delete":
                before = nick.substring(0, selectionStart);
                if (selectionStart === selectionEnd) {
                    selectionEnd++;
                }
                after = nick.substring(selectionEnd);
                return before + after;
        }
    }

    $.fn.mixedLogin = function () {
        let realNick: string = "";
        let that: JQuery = this;
        if (this[0].nodeName !== "INPUT") {
            throw "mixedLogin has to be applied to a <input> element";
        }
        let event = navigator.userAgent.match(/Android/i) ? "textInput" : "keydown";
        let pressedDown = false;
        let selectionStart: number = 0;
        let selectionEnd: number = 0;
        this.on(event, function (e) {
            pressedDown = true;
            let target: HTMLInputElement = <HTMLInputElement> e.currentTarget;
            let before;
            let after;
            let key = e.key || e.originalEvent.data;
            switch (key) {
                case "Backspace":
                case "Delete":
                    realNick = applyComposition(e.currentTarget, realNick, key, target.selectionStart, target.selectionEnd);
                    break;
                case "Enter":
                    break;
                default:
                    if (key.length === 1) {
                        e.preventDefault();
                        before = realNick.substring(0, target.selectionStart);
                        after = realNick.substring(target.selectionEnd);
                        realNick = before + key + after;
                        let matches = realNick.split("#");
                        let oldSelectionStart = e.currentTarget.selectionStart;
                        e.currentTarget.value = matches.length < 2 ? realNick : realNick.replace(/#(.+)/, `#${matches[1].replace(/./g, "*")}`);
                        e.currentTarget.selectionStart = oldSelectionStart + 1;
                        e.currentTarget.selectionEnd = oldSelectionStart + 1;
                    }
                    break;
            }
        }).keydown(function (e) {
            selectionStart = e.currentTarget.selectionStart;
            selectionEnd = e.currentTarget.selectionEnd;
        }).keyup(function (e) {
            let key: string = null;
            if (e.currentTarget.value.length === 0) {
                realNick = "";
            }
            else if (!pressedDown && e.currentTarget.value.length < realNick.length && navigator.userAgent.match(/Android/i)) {
                if (selectionStart === e.currentTarget.selectionStart) {
                    key = "Delete";
                } else if (selectionStart > e.currentTarget.selectionStart) {
                    key = "Backspace";
                }
                realNick = applyComposition(e.currentTarget, realNick, key, selectionStart, selectionEnd);
            }
            pressedDown = false;
            that.data("realNick", realNick);
            if (e.key === "Enter") {
                realNick = "";
            }
        });
        return $(this);
    }
})(jQuery);