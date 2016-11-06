const zip = require('adm-zip');
const fs = require('fs');
const path = require("path");

const execFile = require('child_process').execFile;
var tscPath = 'node_modules/.bin/tsc';
if(process.platform == "win32"){
    tscPath += ".cmd";
}
const child = execFile(tscPath.replace(/\//g, path.sep),[], (error, stdout, stderr)=> {
    if(error){
        //throw error;
    }
    console.log(stdout);
});
