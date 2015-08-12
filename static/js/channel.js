exports.Channel = function (name, nickName) {
    this.name = name;
    this.nick = nickName;
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
        console.log(message);
        var args = JSON.parse(message.data);
        exports.Channel.messageReceived.call(that, args);
    };
    this.sendMessage = function (message) {
        that.send({
            cmd: "chat",
            text: message
        });
    }
};

exports.Channel.messageReceived = null;
