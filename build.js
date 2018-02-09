const fs = require('fs');
const path = require("path");
let webpack = null;
try {
    webpack = require('webpack');
} catch (e) {

}

const execFile = require('child_process').execFile;
webpack(require(`${__dirname}/webpack.config`), function (err, stats) {
    if(err){
        console.error(err);
    }
    console.log("Webpack done");
});

let cordovaPath = `${__dirname}/node_modules/.bin/cordova`;
if(process.platform === "win32"){
    cordovaPath += ".cmd";
}

execFile(path.resolve(cordovaPath), ["prepare"], (error, stdout, stderr) => {
    if(error){
        return;
    }
    console.log("Cordova prepared");
    execFile("node", ["copyIcon.js"], (error, stdout, stderr) =>{
       if(error){
           return console.error(error, stderr.toString());
       }
       console.log("Icon copied");
       execFile(path.resolve(cordovaPath), ["build"], (error, stdout, stderr) => {
          if(error){
              return;
          }
          console.log("Application build successful");
       });
    });
});