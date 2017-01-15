"use strict";

const fs = require("fs");

let config = {
  "width": 1280,
  "height": 720,
  "nickName": "",
  "favourites": ["programming"],
  "openInside": false
};

if (!fs.existsSync("./data.json")) {
  save();
} else {
  let buffer = fs.readFileSync("./data.json", "utf-8");
  config = JSON.parse(buffer.toString());
}

function save() {
  fs.writeFileSync("./data.json", JSON.stringify(config));
}

let getConfig = function() {
  return config;
};

exports.get = getConfig;
exports.save = save;
