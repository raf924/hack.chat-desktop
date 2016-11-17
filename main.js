const electron = require('electron');
const app = electron.app; // Module to control application life.
const BrowserWindow = electron.BrowserWindow; // Module to create native browser window.
const Menu = electron.Menu;
const shell = electron.Shell;
const ipc = electron.ipcMain;

require('require-rebuild')();

let config = require("./config.js");
const fs = require('fs');

//TODO: Add remote config
//TODO: Add tray icon

let myNick = config.get().nickName;

Menu.setApplicationMenu(null);
// Report crashes to our server.
//electron.crashReporter.start({companyName: 'raf924', submitURL: 'http://127.0.0.1'});

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
let mainWindow = null;
let webContents = null;

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform != 'darwin') {
        app.quit();
    }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.

ipc.on("join", function (event, data) {
    event.sender.send("openChannel", data);
});

ipc.on("set", function (event, args) {
    //TODO: Add a remote config
    let obj = JSON.parse(args);
    config.get()[obj.prop] = obj.value;
    config.save();
});

ipc.on("get", function (event, prop, async) {
    let value = config.get()[prop];
    if (async) {
        event.sender.send(prop, value || "");
    } else {
        event.returnValue = value || "";
    }
});

ipc.on("close", function (event) {
    mainWindow.close();
});

ipc.on("minimize", function (event) {
    mainWindow.minimize();
});

ipc.on("fullscreen", function (event) {
    if (mainWindow.isMaximized()) {
        mainWindow.unmaximize()
    } else {
        mainWindow.maximize();
    }
});

app.on('ready', function () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: config.get().width,
        height: config.get().height,
        frame: false,
        icon: "./static/img/icon128.png",
        minWidth: 400,
        minHeight: 400
    });

    Menu.setApplicationMenu(null);

    // and load the index.html of the app.
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    webContents = mainWindow.webContents;
    mainWindow.flashFrame(true);
    // Open the devtools.
    mainWindow.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });

    webContents.on("new-window", function (e, url, frameName, disposition) {
        if (url.match(/(https:(\/\/)hack\.chat)|(file:(\/\/).+\?.+)/i) != null) {
            e.preventDefault();
            this.send("openChannel", url.split("?")[1]);
        } else {
            if (!config.get().openInside) {
                e.preventDefault();
                shell.openExternal(url);
            }
        }
    });
});
