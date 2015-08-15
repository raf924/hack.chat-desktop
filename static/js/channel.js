exports.Channel = function (name, nickName) {
    this.name = name;
    this.nick = nickName;
    this.users = {};
    var that = this;
    var ws = new WebSocket("wss://hack.chat/chat-ws");
    this.send = function (arg) {
        if (ws && ws.readyState == ws.OPEN) {
            ws.send(JSON.stringify(arg))
        }
    };
    window.setInterval(function () {
        that.send({
            cmd: 'ping'
        });
    }, 50000);
    ws.onopen = function () {
        that.send({
            cmd: "join",
            channel: that.name,
            nick: that.nick
        });
    };
    ws.onmessage = function (message) {
        console.log(message.data);
        var args = JSON.parse(message.data);
        if(!that.users[args.nick]){
          users[args.nick] = args.trip||"";
        }
        if(args.nicks){
          args.nicks.forEach(function (nick) {
            if(!that.users[nick]){
              users[nick] = "";
            }
          });
        }
        exports.Channel.messageReceived.call(that, args);
    };
    this.sendMessage = function (message) {
        that.send({
            cmd: "chat",
            text: message
        });
    }
};

exports.Channel.messageReceived = function (args) {
  //the object this is the channel that received the message
};
