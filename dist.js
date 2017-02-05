const builder = require("electron-builder")
const Platform = builder.Platform;
const fs = require('fs');

let platforms = {
    "macos": Platform.MAC,
    "win32": Platform.WINDOWS,
    "linux": Platform.LINUX
};

let prepackagedFolder = fs.readdirSync(`${__dirname}/dist`).filter(function (file) {
    return file.startsWith("Chatron-");
})[0];

let [, platform,] = prepackagedFolder.split("-");

// Promise is returned
builder.build({
    targets: platforms[platform || process.platform].createTarget(),
    prepackaged: `${__dirname}/dist/${prepackagedFolder}`,
    config: {}
}).then(() => {
    // handle result
}).catch((error) => {
    console.error(error);
});