"use strict";

var fs = require("fs");

var config = null;


if (!fs.existsSync("./data.json")) {
    var file = fs.openSync("./data.json", "w");
    fs.closeSync(file);
    config = {
        vars: {}
    };
} else {
    var buffer = fs.readFileSync("./data.json", "utf-8");
    config = JSON.parse(buffer.toString());
}

function save() {
    fs.writeFileSync("./data.json", JSON.stringify(config));
}

exports.getNickName = function () {
    return config.vars.nickName;
};

exports.setNickName = function (nick) {
    config.vars.nickName = nick;
    save();
};

exports.getFavourites = function () {
    return config.vars.favourites;
};

exports.addFavourites = function (channel) {
    config.vars.favourites.push(channel);
    save();
};
