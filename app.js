"use strict";

window.$ = window.jQuery = require('jquery');
window.Hammer = require('./static/js/hammer.min');

const Channel = require("./static/js/channel.js").Channel;
const View = require("./static/js/views.js").View;
const ipc = require('electron').ipcRenderer;
const titlebar = require('titlebar');
const fs = require('fs');

var views = {
    "message": null,
    "user": null,
    "users": null,
    "channel": null
};
var view = null;
for (view in views) {
    if (views.hasOwnProperty(view)) {
        views[view] = new View(view).element;
    }
}

var t = titlebar();
t.appendTo(document.body);

var titleBarEventHandler = function (e) {
    ipc.send(e, function () {
    });
};

function bind(event) {
    t.on(event, function () {
        titleBarEventHandler(event);
    });
};

bind('close');
bind('fullscreen');
bind('minimize');


var message_icons = require("./static/data/message_icons.json");

var channels = {};
var myNick = ipc.sendSync("get", "nickName");
var currentChannel;
var favourites = [];
var parsers = [];

var loadParsers = function () {
    fs.readdir("./parsers", function (err, files) {
        files.forEach(function (file) {
            if (file.match(/[.]js$/i) != null) {
                var parser = require("./parsers/" + file);
                parsers.push(parser);
            }
        });
    });
};

var addFavourite = function (channelName) {
    window.favourites.push(channelName);
    var $favourite = $("<li></li>").append($("<a></a>").attr("href", "#").attr("data-open", channelName).text(channelName)).appendTo($("#favourites"));
    var visibleHeight = $("#favourites").visibleHeight();
    if ($("#favourites").css("max-height") != visibleHeight && $("#favourites").height() > visibleHeight) {
        $("#favourites").css("max-height", visibleHeight);
    }
}

function scrollToBottom() {
    $(".messages").each(function (index, element) {
        $(element).scrollTop(element.scrollHeight);
    });
}

var setMaterialIcon = function ($message, iconName, colour) {
    $message.addClass("avatar");
    var $icon = $("<i></i>");
    $icon.addClass("material-icons circle").addClass(colour).text(iconName);
    $message.prepend($icon);
};

var appendMessage = function ($messages, $message, args) {
    $message.find(".nick").text(args.nick);
    $message.find(".message").html(args.text);
    $message.find(".trip").text(args.trip);
    $messages.append($message);
    scrollToBottom();
};

var parseText = function (text) {
    parsers.forEach(function (parser) {
        text = parser.parse(text);
    });
    return text;
};

function insertAtCursor(text) {
    var pos = $("form#send #textfield")[0].selectionStart || 0;
    var value = $("form#send #textfield").val();
    var new_val = [value.slice(0, pos), text, value.slice(pos)].join('');
    $("form#send #textfield").val(new_val)[0].selectionStart = pos + text.length;
}

var channelEventListener = {
    addUser: function (channel, user) {
        var $user = $(views["user"]);
        $user.attr("user", user).find(".nick").text(user);
        $(`#users .users[for='${channel}']`).append($user);
    },
    tripCodeSet: function (channel, user, tripCode) {
        $(`#users .users[for='${channel}']`).find(".user[user='" + user + "']").find(".trip").text(tripCode);
    },
    removeUser: function (channel, user) {
        $(`#users .users[for='${channel}']`).find(".user[user='" + user + "']").remove();
    },
    messageReceived: function (args) {
        var that = this;
        var $message = $(views["message"]);
        var $messages = $("#channels").find(".channel[id='" + that.channelId + "']").find(".messages");
        var message_icon = message_icons[args.cmd];
        switch (args.cmd) {
            case "onlineSet":
                args.text = "Users online : " + args.nicks.join(", ");
                break;
            case "onlineRemove":
                args.text = args.nick + " has left";
                break;
            case "onlineAdd":
                args.text = args.nick + " has joined";
                break;
            case "chat":
                args.text = parseText(args.text);
                break;
        }
        if (message_icon.title) {
            args.nick = message_icon.title;

        }
        setMaterialIcon($message, message_icon.icon, message_icon.color);
        appendMessage($messages, $message, args);
    }
};


function loadUsers(channel) {

}
$(function () {
    loadParsers();
    $(t.element).append($("<div></div>").text("Chatron"));

    ipc.on("favourites", function (event, favourites) {
        favourites.forEach(function (favourite) {
            addFavourite(favourite);
        });
    });
    ipc.send("get", "favourites", true);
    $("#favourites").on("click", "li a[data-open]", function (e) {
        login($(this).attr("data-open"));
    });
    $("#channels-tabs").tabs("init");
    $(".button-collapse").sideNav({
        menuWidth: 300,
        closeOnClick: false
    });

    $(".addChannel form").submit(function (e) {
        e.preventDefault();
    });
    $(".addChannel form button").click(function (e) {
        e.preventDefault();
        $(".addChannel form button").css("display", "none");
        $(".addChannel form input").css("display", "").focus();
    });
    $(".addChannel form input").keydown(function (e) {
        if (e.keyCode === 13) {
            login($(this).val(), null);
            $(".addChannel form button").css("display", "");
            $(".addChannel form input").css("display", "none");
            $(this).val("");
        }
    }).blur(function (e) {
        $(".addChannel form button").css("display", "");
        $(".addChannel form input").css("display", "none");
    });


    ipc.on("openChannel", function (e, data) {
        console.log(data);
        var {"channel": channel, "nick": nick} = JSON.parse(data);
        login(channel, nick);
    });

    $("#channels-tabs").on("tabChanged", function (e, channel) {
        loadUsers(channel);
        window.currentChannel = channel;
    });

    $("form#send").submit(function (e) {
        e.preventDefault();
    });
    $("form#send #textfield").keydown(function (e) {
        if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
            channels[$("#channels-tabs .tab a.active").attr("data-tab")].sendMessage($(this).val());
            $(this).val("");
        }
    });
    $("#nickPrompt form").submit(function (e) {
        e.preventDefault();
        var $nick = $(this).find("input.validate");
        var nick = $nick.data("realNick");
        ipc.send("join", JSON.stringify({"channel": $nick.data("channel"), "nick": nick}));
        $nick.val("").data("realNick", "").data("channel", "");
        var forAll = $(this).find("#forAll:checked");
        if (forAll.length > 0) {
            ipc.send("set", JSON.stringify({
                prop: "nickName",
                value: nick.split("#")[0] + "#"
            }));
            window.myNick = nick;
        }
        /*if (window.hasOwnProperty("currentChannel") && window.currentChannel !== undefined && window.currentChannel !== "") {
            openChannel(window.currentChannel, nick);
        }*/
        $("#nickPrompt").closeModal();
        if (document.body.clientWidth < 992) {
            $(".button-collapse").sideNav("hide");
        }
    });
    $("#nickPrompt form input[type='text']").keydown(function (e) {
        $(this).data("keyCode", e.keyCode);
        if ((e.keyCode !== 8 && e.keyCode != 46) || $(this).data("selectionStart") == null) {
            $(this).data("selectionEnd", e.currentTarget.selectionEnd);
            $(this).data("selectionStart", e.currentTarget.selectionStart);
        }
    }).click(function (e) {
        $(this).data("selectionEnd", e.currentTarget.selectionEnd);
        $(this).data("selectionStart", e.currentTarget.selectionStart);
    }).on("select", function (e) {
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
    $("#menu").on("click", "a.fav", function (e) {
        e.preventDefault();
        addFavourite($(this).attr("data-add"));
        ipc.send("set", {
            prop: "favourites",
            value: favourites
        });
    });
    $("body").on("click", ".channel .title a, .user a.nick", function (e) {
        insertAtCursor("@" + $(this).text() + " ");
    });
    $(".button-collapse[data-activates='sidemenu']").click(function (e) {
        $("div.drag-target").remove();
        $("body").on("click", "#sidenav-overlay:last-of-type", function (e) {
            $("#menu,#settings").removeClass("flipped");
        });
    });
    $("a[data-flip='settings']").click(function (e) {
        if ($("#menu, #settings").hasClass("flipped")) {
            $("#menu,#settings").removeClass("flipped");
        } else {
            $("#menu,#settings").addClass("flipped");
        }
    });
    $("#channels-tabs").on("tabClosed", function (e, channelId) {
        closeChannel(channelId);
        if ($(this).find(".tab").length == 0) {
            $("#send textarea").attr("disabled", "");
        }
    });
})
;

function closeChannel(channelId) {
    channels[channelId].close();
    delete channels[channelId];
    $("[id='" + channelId + "'], [for='" + channelId + "']").remove();
}

function login(channel, nick) {
    if (nick !== undefined && nick !== "") {
        openChannel(channel, nick);
    } else if (myNick == null || myNick == "" || myNick.split("#").length > 1 && myNick.split("#")[1].length == 0) {
        $("#nickPrompt").openModal();
        $("#nickPrompt input.validate").val(myNick).data("realNick", myNick).data("channel", channel);
    } else {
        openChannel(channel, myNick);
    }
}

function openChannel(channel, nick) {
    var ch = new Channel(channel, nick);
    for (event in channelEventListener) {
        if (channelEventListener.hasOwnProperty(event)) {
            ch.on(event, channelEventListener[event]);
        }
    }
    channels[ch.channelId] = ch;
    var $channel = $(views["channel"]);
    $channel.attr("id", ch.channelId);
    $channel.appendTo("#channels");
    var $tab = $("<li></li>").addClass("tab row");
    var $close_link = $("<a href='#!'></a>").attr("data-close", ch.channelId).addClass("col s1 ch-close waves-effect waves-teal").append($("<i></i>").addClass("material-icons").text("close"));
    var $fav_link = $("<a href='#!'></a>").attr("data-add", ch.channelId).addClass("col s1 fav waves-effect waves-teal").append($("<i></i>").addClass("material-icons").text("grade"));
    var $link = $("<a href='#!'></a>").addClass("active ch-link col s8").text(ch.channelId.replace("#", "")).attr("data-tab", ch.channelId);
    var $badge = $("<a>0</a>").addClass("badge col s1");

    $tab.append($fav_link);
    $tab.append($link);
    $tab.append($badge);
    $tab.append($close_link);
    $tab.attr("for", ch.channelId);
    $("#channels-tabs").append($tab);
    $("form#send #textfield").removeAttr("disabled");
    var $users = $(views["users"]);
    $users.attr("for", ch.channelId);
    $(".users").css("display:none");
    $("#users").append($users);

    window.currentChannel = channel;
}
