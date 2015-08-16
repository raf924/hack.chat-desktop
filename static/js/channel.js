exports.Channel = function(name, nickName) {
  this.name = name;
  this.nick = nickName;
  this.users = {};
  var that = this;
  var ws = new WebSocket("wss://hack.chat/chat-ws");
  this.send = function(arg) {
    if (ws && ws.readyState == ws.OPEN) {
      ws.send(JSON.stringify(arg))
    }
  };
  window.setInterval(function() {
    that.send({
      cmd: 'ping'
    });
  }, 50000);
  ws.onopen = function() {
    that.send({
      cmd: "join",
      channel: that.name,
      nick: that.nick
    });
  };
  ws.onmessage = function(message) {
    console.log(message.data);
    var args = JSON.parse(message.data);
    if (args.nick != null && !that.users[args.nick]) {
      that.users[args.nick] = args.trip || "";
      exports.Channel.addUser(that.name, args.nick);
    } else if (args.trip) {
      exports.Channel.setTripCode(that.name, args.nick, args.trip);
    } else if (args.cmd == "onlineRemove") {
      exports.Channel.removeUser(that.name, args.nick);
    } else if (args.nicks) {
      for (var nick of args.nicks) {
        if (!that.users[nick]) {
          that.users[nick] = "";
          exports.Channel.addUser(that.name, nick);
        }
      }
    }
    exports.Channel.messageReceived.call(that, args);
  };
  this.sendMessage = function(message) {
    that.send({
      cmd: "chat",
      text: message
    });
  }
};

exports.Channel.addUser = function(channelName, user) {
  // body...
}

exports.Channel.removeUser = function(channelName, user) {

}

exports.Channel.setTripCode = function(channelName, user, tripCode) {

}

exports.Channel.messageReceived = function(args) {
  //the object this is the channel that received the message
};
