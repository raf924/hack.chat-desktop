(function ($) {
    $.fn.mixedLogin = function () {
        if (this[0].nodeName !== "INPUT") {
            throw "mixedLogin has to be applied to a <input> element";
        }
        this.keydown(function (e) {
            let target: HTMLInputElement = <HTMLInputElement> e.currentTarget;
            $(this).data("keyCode", e.keyCode);
            if ((e.keyCode !== 8 && e.keyCode != 46) || $(this).data("selectionStart") == null) {
                $(this).data("selectionEnd", target.selectionEnd);
                $(this).data("selectionStart", target.selectionStart);
            }
        }).click(function (e) {
            let target: HTMLInputElement = <HTMLInputElement> e.currentTarget;
            $(this).data("selectionEnd", target.selectionEnd);
            $(this).data("selectionStart", target.selectionStart);
        }).on("select", function (e) {
            let target: HTMLInputElement = <HTMLInputElement> e.currentTarget;
            $(this).data("selectionEnd", target.selectionEnd);
            $(this).data("selectionStart", target.selectionStart);
        }).on("input", function (e) {
            if ($(this).data("realNick") == null) {
                $(this).data("realNick", "");
            }
            if ($(this).data("keyCode") == 8 || $(this).data("keyCode") == 46) {
                let oldNick = $(this).data("realNick");
                let before = oldNick;
                switch ($(this).data("keyCode")) {
                    case 8://BACKSPACE
                        before = oldNick.slice(0, $(this).data("selectionStart") - 1);
                        break;
                    case 46://DELETE
                        before = oldNick.slice(0, $(this).data("selectionStart"));
                        break;
                }
                let after = oldNick.slice($(this).data("selectionEnd") + 1);
                $(this).data("realNick", before + after);
            } else {
                let target: HTMLInputElement = <HTMLInputElement> e.currentTarget;
                let nick = target.value;
                let idxStart = $(this).data("selectionStart") || target.selectionStart - 1;
                let idxEnd = $(this).data("selectionEnd") || target.selectionStart;
                let newChar = nick[idxStart];
                $(this).data("realNick", `${$(this).data("realNick").slice(0, idxStart)}${newChar}${$(this).data("realNick").slice(idxEnd)}`);
                let matches = nick.match(/#(.+)/i);
                if (matches !== null) {
                    let password = matches[1];
                    target.value = nick.replace(/#(.+)/, `#${password.replace(/./g, "*")}`);
                }
            }
            $(this).data("selectionStart", null);
            $(this).data("selectionEnd", null);
            $(this).data("keyCode", null);
        });
    }
})(jQuery);