const packager = require('electron-packager');
const fs = require('fs');

let packageFile = fs.readFileSync('./node_modules/electron/package.json', 'utf-8');
let info = JSON.parse(packageFile);
let args = process.argv;

packager({
    dir: ".",
    name: "Chatron",
    platform: args[2] || process.platform,
    overwrite: true,
    electronVersion: `${info.version}`,
    arch: args[3] || process.arch,
    out: "dist",
    asar: true,
    ignore: ["build.js", "start.js", "package.js$", "src", "tsconfig.json", ".idea", ".gitattributes", ".gitignore", "data.json", "cordova", "build", "dist"],
    icon: "icon.ico",
    win32metadata: {
        CompanyName: "raf924",
        FileDescription: "Desktop chat client",
        ProductName: "Chatron",
        InternalName: "Chatron"
    },
    prune: true
}, function done(err, appPath) {
    console.log(err);
    console.log(appPath);
});
