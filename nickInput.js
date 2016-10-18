$(".addChannel form").submit(function (e) {
    e.preventDefault();
    var $nick = $(this).find("input");
    myNick = $nick.data("realNick");
    ipc.send("join", $(this).val());
    $nick.val("").data("realNick", "").data("channel", "");
    $(".addChannel form button").css("display", "");
    $(".addChannel form input").css("display", "none");
});
$(".addChannel form button").click(function (e) {
    e.preventDefault();
    $(".addChannel form button").css("display", "none");
    $(".addChannel form input").css("display", "").focus();
});
$(".addChannel form input").keydown(function (e) {
    $(this).data("keyCode", e.keyCode);
    if ((e.keyCode !== 8 && e.keyCode != 46) || $(this).data("selectionStart") == null) {
        $(this).data("selectionEnd", e.currentTarget.selectionEnd);
        $(this).data("selectionStart", e.currentTarget.selectionStart);
    }
}).blur(function (e) {
    $(".addChannel form button").css("display", "");
    $(".addChannel form input").css("display", "none");
}).click(function (e) {
    $(this).data("selectionEnd", e.currentTarget.selectionEnd);
    $(this).data("selectionStart", e.currentTarget.selectionStart);
}).on("select", function () {
    $(this).data("selectionEnd", e.currentTarget.selectionEnd);
    $(this).data("selectionStart", e.currentTarget.selectionStart);
}).on("input", function (e) {
    if ($(this).data("realNick") == null) {
        $(this).data("realNick", "");
    }
    if ($(this).data("keyCode") == 8 || $(this).data("keyCode") == 46) {
        var oldNick = $(this).data("realNick");
        var before = oldNick;
        switch ($(this).data("keyCode")) {
            case 8://BACKSPACE
                before = oldNick.slice(0, $(this).data("selectionStart") - 1);
                break;
            case 46://DELETE
                var before = oldNick.slice(0, $(this).data("selectionStart"));
                break;
        }
        var after = oldNick.slice($(this).data("selectionEnd") + 1);
        $(this).data("realNick", before + after);
    } else {
        var nick = e.currentTarget.value;
        var idxStart = $(this).data("selectionStart") || e.currentTarget.selectionStart - 1;
        var idxEnd = $(this).data("selectionEnd") || e.currentTarget.selectionStart;
        var newChar = nick[idxStart];
        $(this).data("realNick", $(this).data("realNick").slice(0, idxStart) + newChar + $(this).data("realNick").slice(idxEnd));
        var matches = nick.match(/#(.+)/i);
        if (matches !== null) {
            var password = matches[1];
            e.currentTarget.value = nick.replace(/#(.+)/, "#" + password.replace(/./g, "*"));
        }
    }
    $(this).data("selectionStart", null);
    $(this).data("selectionEnd", null);
    $(this).data("keyCode", null);
});