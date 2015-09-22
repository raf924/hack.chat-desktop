"use strict";

var app = require('app'); // Module to control application life.
var BrowserWindow = require('browser-window'); // Module to create native browser window.
var Menu = require("menu");
var shell = require('shell');
var nativeImage = require("native-image");
var ipc = require('ipc');
var config = require("./config.js");
var fs = require('fs');

var myNick = config.get().nickName;

Menu.setApplicationMenu(null);
// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
var mainWindow = null;
var webContents = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.

ipc.on("join", function(event, channel) {
  event.sender.send("openChannel", channel);
});

ipc.on("set", function(event, args) {
  var obj = JSON.parse(args);
  config.get()[obj.prop] = obj.value;
  config.save();
});

ipc.on("get", function(event, prop) {
  var value = config.get()[prop];
  //event.sendReply(typeof(value) == "object" ? JSON.parse(value) : value);
  event.returnValue = value||"";
});

ipc.on("close", function(event) {
  mainWindow.close();
});

ipc.on("minimize", function(event) {
  mainWindow.minimize();
});

ipc.on("fullscreen", function(event) {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize();
  }
});

app.on('ready', function() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: config.get().width,
    height: config.get().height,
    frame: false,
    icon: "./static/img/icon128.png",
    "min-width": 800,
    "min-height": 600
  });

  Menu.setApplicationMenu(null);

  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');
  webContents = mainWindow.webContents;
  mainWindow.flashFrame(true);
  // Open the devtools.
  mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });

  webContents.on("new-window", function(e, url, frameName, disposition) {
    if (url.match(/https:[/][/]hack[.]chat/i) != null) {
      event.PreventDefault();
      ipc.send("openChannel", url.split("?")[1]);
    } else {
      if (!config.get().openInside) {
        event.PreventDefault();
        shell.openExternal("url");
      }
    }
  });
});
