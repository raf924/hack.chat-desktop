const packager = require('electron-packager');
const fs = require('fs');

let packageFile = fs.readFileSync('./node_modules/electron/package.json', 'utf-8');
let info = JSON.parse(packageFile);
let args = process.argv;

//TODO: find better way to ignore files

packager({
    dir: ".",
    name: "Chatron",
    platform: args[2] || process.platform,
    overwrite: true,
    electronVersion: `${info.version}`,
    arch: args[3] || process.arch,
    out: "dist",
    asar: true,
    ignore: ["webpack.config.js", ".yml", "bintray.json", "start.js", "package.js$", "dist.js", `tsconfig.json`, `data.json`, `src`,  ".idea", ".gitattributes", ".gitignore", "cordova", "build", /material-design-icons\/(?!iconfont)/],
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