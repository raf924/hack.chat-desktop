const packager = require('electron-packager');
const fs = require('fs');

var packageFile = fs.readFileSync('./node_modules/electron/package.json', 'utf-8');
var info = JSON.parse(packageFile);
var args = process.argv;

packager({
    dir: ".",
    name: "Chatron",
    platform: args[2] || "all",
    overwrite: true,
    version: `${info.version}`,
    arch: args[3] || "all",
    out: "dist",
    asar: true,
    ignore: ["build.js", "start.js", "package.js", "src", "tsconfig.json", ".idea", ".gitattributes", ".gitignore", "data.json"],
    icon: "icon.ico",
    prune: false //TODO: find out why it must be set to false to work
}, function done(err, appPath) {
    console.log(err);
    console.log(appPath);
});
