"use strict";

var app = require('app'); // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.
var Menu = require("menu");
var nativeImage = require("native-image");
var ipc = require('ipc');
var config = require("./config.js");

var myNick = config.getNickName();

Menu.setApplicationMenu(null);
// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
var mainWindow = null;

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

ipc.on("join", function (event, channel) {
    event.sender.send("openChannel", channel);
});

ipc.on("setNick", function (event, nick) {
    config.setNickName(nick);
    myNick = nick;
});

ipc.on("askForNick", function (event) {
    if (myNick !== null) {
        event.returnValue = null;
    } else {
        event.returnValue = myNick;
    }
});

app.on('ready', function () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 1900,
        height: 1080
    });

    Menu.setApplicationMenu(null);

    // and load the index.html of the app.
    mainWindow.loadUrl('file://' + __dirname + '/index.html');

    // Open the devtools.
    mainWindow.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
});
