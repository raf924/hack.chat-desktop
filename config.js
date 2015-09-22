"use strict";

var fs = require("fs");

var config = {
  "width": 1280,
  "height": 720,
  "nickName": "",
  "favourites": ["programming"],
  "openInside": false
};

if (!fs.existsSync("./data.json")) {
  save();
} else {
  var buffer = fs.readFileSync("./data.json", "utf-8");
  config = JSON.parse(buffer.toString());
}

function save() {
  fs.writeFileSync("./data.json", JSON.stringify(config));
}

var getConfig = function() {
  return config;
}

exports.get = getConfig;
exports.save = save;
