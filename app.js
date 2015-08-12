window.$ = window.jQuery = require('./static/js/jquery.min.js');
window.Hammer = require("./static/js/hammer.min.js");
var Channel = require("./static/js/channel.js").Channel;
var ipc = require('ipc');

var channels = [];
var myNick = ipc.sendSync("askForNick");

var setMaterialIcon = function (title, iconName, colour) {
    this.args.nick = title;
    this.$message.addClass("avatar");
    var $icon = $("<i></i>");
    $icon.addClass("material-icons circle").addClass(colour).text(iconName);
    this.$message.prepend($icon);
};

var appendMessage = function ($message, args) {
    $message.find(".nick").text(args.nick);
    $message.find(".message").text(args.text);
    this.append($message);
};

Channel.messageReceived = function (args) {
    console.log(this);
    var that = this;
    $.get("./static/views/message.html", function (data) {
        var $message = $(data);
        var $messages = $("#channels").has("#" + that.name).find(".messages");
        switch (args.cmd) {
            case "warn":
                setMaterialIcon.call({
                    $message: $message,
                    args: args
                }, "", "warning", "red");
                break;
            case "onlineSet":
                setMaterialIcon.call({
                    $message: $message,
                    args: args
                }, "", "recent_actors", "green");
                break;
            case "onlineRemove":
                args.text = args.nick += " has left";
                setMaterialIcon.call({
                    $message: $message,
                    args: args
                }, "", "perm_identity", "red");
                break;
            case "onlineAdd":
                args.text = args.nick += " has joined";
                setMaterialIcon.call({
                    $message: $message,
                    args: args
                }, "", "perm_identity", "green");
                break;
            case "info":
                setMaterialIcon.call({
                    $message: $message,
                    args: args
                }, "INFO", "info_outline", "green");
                break;
            case "chat":
                if (args.nick === that.nick)
                    args.nick += "(Me)";
                setMaterialIcon.call({
                    $message: $message,
                    args: args
                }, args.nick, "chat_bubble_outline", "white");
                break;
        }
        appendMessage.call($messages, $message, args);

    });
};

$(function () {
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
            ipc.send("join", $(this).val());
            $(".addChannel form button").css("display", "");
            $(".addChannel form input").css("display", "none");
        }
    }).blur(function (e) {
        $(".addChannel form button").css("display", "");
        $(".addChannel form input").css("display", "none");
    });

    ipc.on("openChannel", function (channel) {
        login(channel);
    });
});


var COMMANDS = {
    chat: function (args) {
        if (ignoredUsers.indexOf(args.nick) >= 0) {
            return
        }
        pushMessage(args)
    },
    info: function (args) {
        args.nick = '*'
        pushMessage(args)
    },
    warn: function (args) {
        args.nick = '!'
        pushMessage(args)
    },
    onlineSet: function (args) {
        var nicks = args.nicks
        usersClear()
        nicks.forEach(function (nick) {
            userAdd(nick)
        })
        pushMessage({
            nick: '*',
            text: "Users online: " + nicks.join(", ")
        })
    },
    onlineAdd: function (args) {
        var nick = args.nick
        userAdd(nick)
        if ($('#joined-left').checked) {
            pushMessage({
                nick: '*',
                text: nick + " joined"
            })
        }
    },
    onlineRemove: function (args) {
        var nick = args.nick
        userRemove(nick)
        if ($('#joined-left').checked) {
            pushMessage({
                nick: '*',
                text: nick + " left"
            })
        }
    },
};


function login(channel) {
    if (myNick !== "") {
        $("#nickPrompt").openModal();
        $("#nickPrompt input.validate").focus();
        $("#nickPrompt form").submit(function (e) {
            e.preventDefault();
            var forAll = $(this).find("#forAll:checked");
            var nick = $(this).find("input.validate").val();
            if (forAll.length > 0) {
                myNick = nick;
                ipc.send("setNick", nick);
            }
            if (channel !== "") {
                openChannel(channel, nick);
            }
            $("#nickPrompt").closeModal();
        });
    }
}

function openChannel(channel, nick) {
    var ch = new Channel(channel, nick);
    channels.push(ch);
    var page = $.get("./static/views/channel.html", function (data) {
        var $channel = $(data);
        $("#channels-tabs .disabled").remove();
        $channel.attr("id", channel);
        $channel.appendTo("#channels");
        var $tab = $("<li></li>").addClass("tab col s1");
        var $link = $("<a href='#" + channel + "'>" + channel + "</a>");
        var $badge = $("<span>0</span>").addClass("badge").css("right", "auto");
        $link.append($badge);
        $tab.append($link);
        $("#channels-tabs").append($tab);
        $("#channels-tabs").find("*").css("width", "");
        $("#channels-tabs").tabs("select_tab", channel);
        var $channel = $("#channels").find("#" + channel);
        $channel.find("form").submit(function (e) {
            e.preventDefault();
        });
        $channel.find("form #textfield").keydown(function (e) {
            if (e.keyCode === 13 && !e.shiftKey) {
                e.preventDefault();
                ch.sendMessage($(this).val());
                $(this).val("");
            }
        });
    });
}
