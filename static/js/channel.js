var Channel = function(name, nickName) {
  this.name = name;
  this.nick = nickName;
  this.channelId = nickName.split("#")[0] + (nickName.split("#").length > 1 ? "#" : "") + "@" + name;
  this.users = {};
  var that = this;
  var ws = new WebSocket("wss://hack.chat/chat-ws");
  this.ws = ws;
  window.setInterval(function() {
    that.send({
      cmd: 'ping'
    });
  }, 50000);
  this.ws.onopen = function() {
    that.send({
      cmd: "join",
      channel: that.name,
      nick: that.nick
    });
  };
  this.ws.onmessage = function(message) {
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
};

Channel.prototype.send = function(args) {
  if (this.ws && this.ws.readyState == this.ws.OPEN) {
    this.ws.send(JSON.stringify(args));
  }
};

Channel.prototype.sendMessage = function(message) {
  this.send({
    cmd: "chat",
    text: message
  });
};

Channel.prototype.close = function () {
  this.ws.close();
};

exports.Channel = Channel;

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
