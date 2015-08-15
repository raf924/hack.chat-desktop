//TODO: Clean the code (but no rush)
window.$ = window.jQuery = require('./static/js/jquery.min.js');
window.Hammer = require("./static/js/hammer.min.js");
var Channel = require("./static/js/channel.js").Channel;
var ipc = require('ipc');
var titlebar = require('titlebar');

var t = titlebar();
t.appendTo(document.body);

var titleBarEventHandler = function(e) {
  ipc.send(e, function() {});
};

t.on('close', function() {
  titleBarEventHandler("close");
});
t.on("fullscreen", function() {
  titleBarEventHandler("fullscreen");
});
t.on("minimize", function() {
  titleBarEventHandler("minimize");
});

var message_icons = {
  chat: {
    icon: "chat_bubble_outline",
    color: "blue"
  },
  info: {
    icon: "info_outline",
    color: "green",
    title: ""
  },
  onlineSet: {
    icon: "recent_actors",
    color: "green",
    title: ""
  },
  onlineAdd: {
    icon: "perm_identity",
    color: "green"
  },
  onlineRemove: {
    icon: "perm_identity",
    color: "yellow",
    title: ""
  },
  warn: {
    icon: "warning",
    color: "red",
    title: ""
  }
}

var channels = {};
var myNick = ipc.sendSync("askForNick");
var currentChannel;

function scrollToBottom() {
  $(".messages").scrollTop($(".messages")[0].scrollHeight);
}

var setMaterialIcon = function($message,iconName, colour) {
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
  $.get("./static/views/message.html", function(data) {
    var $message = $(data);
    var $messages = $("#channels").has("#" + that.name).find(".messages");
    var message_icon = message_icons[args.cmd];
    if (!message_icon.title) {
      message_icon.title = args.nick;
    }
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
    args.nick = message_icon.title;
    setMaterialIcon($message,message_icon.icon, message_icon.color);
    appendMessage($messages, $message, args);
  });
};

function insertAtCursor(text) {
  var pos = $("form#send #textfield")[0].selectionStart || 0;
  var value = $("form#send #textfield").val();
  var new_val = [value.slice(0, pos), text, value.slice(pos)].join('');
  $("form#send #textfield").val(new_val)[0].selectionStart = pos + text.length;
}

$(function() {
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
    }
  }).blur(function(e) {
    $(".addChannel form button").css("display", "");
    $(".addChannel form input").css("display", "none");
  });

  ipc.on("openChannel", function(channel) {
    login(channel);
  });

  $(".tabs a").click(function(e) {
    var channel = $(this).data("tab");
    $("#users .user").remove();
    $.get("./static/views/user.html", function(data) {
      var users = channels[channel];
      for (var user in users) {
        if (users.hasOwnProperty(user)) {
          $(data).find(".nick").text(user);
          $(data).find("trip").text(users[user]);
        }
      }
    });
  });

  $("form#send").submit(function(e) {
    e.preventDefault();
  });
  $("form#send #textfield").keydown(function(e) {
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();
      channels[$("#channels-tabs a.active").data("tab")].sendMessage($(this).val());
      $(this).val("");
    }
  });
  $(".channel .title a").click(function(e) {
    insertAtCursor(" @" + $(this).val() + " ");
  });

  var sidemenu_button = $("<a></a>");
  sidemenu_button.addClass("button-collapse hide-on-large-only col s1");
  sidemenu_button.append($("<i></i>").addClass("mdi-navigation-menu"));
  $("header .row").prepend(sidemenu_button);
  sidemenu_button.attr("data-activates", "sidemenu").attr("href", "#");
  $(t.element).append($("<div></div>").text("Chatron"));
  $(".button-collapse").sideNav();
  $(".button-collapse[data-activates='sidemenu']").click(function(e) {
    $(".button-collapse[data-activates='settings']").click();
    $("body").on("click", "#sidenav-overlay:last-of-type", function(e) {
      $("#sidemenu,#settings").removeClass("flipped");
      $(".button-collapse[data-activates='sidemenu']").sideNav("hide");
      $("body").off();
    });
  });
  $("a[data-flips='settings']").click(function(e) {
    $("#sidemenu,#settings").addClass("flipped");
  });
  $("div.drag-target").remove();
});

function login(channel) {
  if (myNick !== "") {
    $("#nickPrompt").openModal();
    $("#sidenav-overlay").remove();
    $("#nickPrompt input.validate").focus();
    $("#nickPrompt form").submit(function(e) {
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
      $(".side-nav").css("left", "-250px");
      $("#sidenav-overlay").remove();
    });
  }
}

function openChannel(channel, nick) {
  var ch = new Channel(channel, nick);
  channels[channel] = ch;
  console.log(channels);
  var page = $.get("./static/views/channel.html", function(data) {
    var $channel = $(data);
    $("#channels-tabs .disabled").remove();
    $channel.attr("id", channel);
    $channel.appendTo("#channels");
    var $tab = $("<li></li>").addClass("tab col s1");
    var $link = $("<a href='#" + channel + "'>" + channel + "</a>").data("tab", channel);
    var $badge = $("<span>0</span>").addClass("badge").css("right", "auto");
    $link.append($badge);
    $tab.append($link);
    $("#channels-tabs").append($tab);
    $("#channels-tabs").find("*").css("width", "");
    $("#channels-tabs").tabs("select_tab", channel);
    $("form#send #textfield").removeAttr("disabled");
  });
}
