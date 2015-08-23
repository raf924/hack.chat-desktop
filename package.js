var packager = require('electron-packager');

var args = process.argv;
args.slice(0, 2);

packager({
    dir: ".",
    name: "Chatron",
    platform: args[0] | "all",
    overwrite: true,
    version: "0.30.4",
    arch: args[1] | "all",
    out: "dist",
    ignore: "node_modules/(electron-builder|.bin)|dist|.bin",
    asar: true,
    icon:"icon.ico"


}, function done(err, appPath) {
    console.log(err);
    console.log(appPath);
});
