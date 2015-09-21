//TODO: Clean the code (but no rush)
"use strict";

window.$ = window.jQuery = require('./static/js/jquery.min.js');
window.Hammer = require("./static/js/hammer.min.js");
var Channel = require("./static/js/channel.js").Channel;
var View = require("./static/js/views.js").View
var ipc = require('ipc');
var titlebar = require('titlebar');

var views = {"message": null, "user": null, "users": null, "channel": null};
for (var view in views) {
  views[view] = new View(view);
}

var t = titlebar();
t.appendTo(document.body);

var titleBarEventHandler = function(e) {
  ipc.send(e, function() {});
};

function bind(event) {
  t.on(event, function() {
    titleBarEventHandler(event);
  });
};

bind('close');
bind('fullscreen');
bind('minimize');


var message_icons = require("./static/data/message_icons.json");

var channels = {};
var myNick = ipc.sendSync("askForNick");
var currentChannel;

function scrollToBottom() {
  $(".messages").scrollTop($(".messages")[0].scrollHeight);
}

var setMaterialIcon = function($message, iconName, colour) {
  $message.addClass("avatar");
  var $icon = $("<i></i>");
  $icon.addClass("material-icons circle").addClass(colour).text(iconName);
  $message.prepend($icon);
};

var appendMessage = function($messages, $message, args) {
  $message.find(".nick").text(args.nick);
  $message.find(".message").text(args.text);
  $messages.append($message);
  scrollToBottom();
};

Channel.messageReceived = function(args) {
  var that = this;
  var $message = views["message"].clone();
  var $messages = $("#channels").find(".channel#" + that.name).find(".messages");
  var message_icon = message_icons[args.cmd];
  switch (args.cmd) {
    case "onlineSet":
      args.text = "Users online : " + args.nicks.join(", ");
      break;
    case "onlineRemove":
      args.text = args.nick += " has left";
      break;
    case "onlineAdd":
      args.text = args.nick += " has joined";
      break;
  }
  if (message_icon.title) {
    args.nick = message_icon.title;
  }
  setMaterialIcon($message, message_icon.icon, message_icon.color);
  appendMessage($messages, $message, args);
};

function insertAtCursor(text) {
  var pos = $("form#send #textfield")[0].selectionStart || 0;
  var value = $("form#send #textfield").val();
  var new_val = [value.slice(0, pos), text, value.slice(pos)].join('');
  $("form#send #textfield").val(new_val)[0].selectionStart = pos + text.length;
}

Channel.addUser = function(channel, user) {
  var $user = views["user"].clone();
  $user.attr("user", user).find(".nick").text(user);
  $("#users .users[for='" + channel + "']").append($user);
};

Channel.setTripCode = function(channel, user, tripCode) {
  $("#users .users[for='" + channel + "']").find(".user[user='" + user + "']").find(".trip").text(tripCode);
};

Channel.removeUser = function(channel, user) {
  $("#users .users[for='" + channel + "']").find(".user[user='" + user + "']").remove();
};

$(function() {
  $("#channels-tabs").tabs("init");
  $(".button-collapse").sideNav({
    menuWidth: 300,
    closeOnClick: false
  });
  $(".addChannel form").submit(function(e) {
    e.preventDefault();
  });
  $(".addChannel form button").click(function(e) {
    e.preventDefault();
    $(".addChannel form button").css("display", "none");
    $(".addChannel form input").css("display", "").focus();
  });
  $(".addChannel form input").keydown(function(e) {
    if (e.keyCode === 13) {
      ipc.send("join", $(this).val());
      $(".addChannel form button").css("display", "");
      $(".addChannel form input").css("display", "none");
      $(this).val("");
    }
  }).blur(function(e) {
    $(".addChannel form button").css("display", "");
    $(".addChannel form input").css("display", "none");
  });

  ipc.on("openChannel", function(channel) {
    login(channel);
  });

  $(".tabs").on("tabChanged", function(e, channel) {
    loadUsers(channel);
    currentChannel = channel;
  });

  $("form#send").submit(function(e) {
    e.preventDefault();
  });
  $("form#send #textfield").keydown(function(e) {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      channels[$("#channels-tabs .tab a.active").attr("data-tab")].sendMessage($(this).val());
      $(this).val("");
    }
  });
  $("#nickPrompt form").submit(function(e) {
    e.preventDefault();
    var forAll = $(this).find("#forAll:checked");
    var nick = $(this).find("input.validate")[0].previousSibling.value;
    if (forAll.length > 0) {
      window.myNick = nick;
      ipc.send("setNick", nick);
    }
    if (window.currentChannel !== "") {
      openChannel(window.currentChannel, nick);
    }
    $("#nickPrompt").closeModal();
    if (document.body.width < 992) {
      $(".side-nav").css("left", "-310px");
    }
    $(this).find("input.validate")[0].previousSibling.value = "";
    $(this).find("input.validate").val("");
  });
  $("#nickPrompt form input[type='text']").keyup(function(e) {
    var prev = e.currentTarget.previousSibling;
    if (prev.value == null) {
      prev.value = "";
    }
    if (e.keyCode == 8) {
      var value = prev.value;
      prev.value = value.slice(0, value.length - 1);
      return;
    }
    var nick = e.currentTarget.value;
    var lastChar = nick[nick.length - 1];
    if (lastChar == "*" && e.which != 106) {
      lastChar = "";
    }
    if (nick.length > prev.value.length) {
      prev.value += lastChar;
    }
    var matches = nick.match(/#(.+)/i);
    if (matches !== null) {
      var password = nick.match(/#(.+)/i)[1];
      e.currentTarget.value = nick.replace(/#(.+)/, "#" + password.replace(/./g, "*"));
    }
  });
  $("body").on("click", ".channel .title a, .user a.nick", function(e) {
    insertAtCursor(" @" + $(this).text() + " ");
  });

  $(t.element).append($("<div></div>").text("Chatron"));
  $(".button-collapse[data-activates='sidemenu']").click(function(e) {
    $("body").on("click", "#sidenav-overlay:last-of-type", function(e) {
      $("#menu,#settings").removeClass("flipped");
    });
  });
  $("a[data-flips='settings']").click(function(e) {
    if ($("#menu, #settings").hasClass("flipped")) {
      $("#menu,#settings").removeClass("flipped");
    } else {
      $("#menu,#settings").addClass("flipped");
    }
  });
  $("div.drag-target").remove();
});

function login(channel) {
  if (myNick !== "") {
    $("#nickPrompt").openModal();
    $("#nickPrompt input.validate").focus();
    window.currentChannel = channel;
  }
}

function openChannel(channel, nick) {
  var ch = new Channel(channel, nick);
  channels[channel] = ch;
  var $channel = views["channel"].clone();
  $channel.attr("id", channel);
  $channel.appendTo("#channels");
  var $tab = $("<li></li>").addClass("tab");
  var $link = $("<a href='#!'></a>").addClass("active").text(channel).attr("data-tab", channel);
  var $badge = $("<span>0</span>").addClass("badge").css("right", 0);
  $link.append($badge);
  $tab.append($link);
  $("#channels-tabs").append($tab);
  $("form#send #textfield").removeAttr("disabled");
  var $users = views["users"].clone();
  $users.attr("for", channel);
  $(".users").css("display:none");
  $("#users").append($users);
}
