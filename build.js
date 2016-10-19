const zip = require('adm-zip');
const fs = require('fs');
const path = require("path");
var package = fs.readFileSync('./node_modules/materialize-css/package.json', 'utf-8');

var info = JSON.parse(package);

var zFile = new zip(`./node_modules/materialize-css/bin/materialize-v${info.version}.zip`);
var entries = zFile.getEntries();
var movable = [];
entries.forEach((zipEntry)=>{
    if(zipEntry.isDirectory && zipEntry.entryName.split("/").length == 3){
        zFile.extractEntryTo(zipEntry.entryName, `./static/${zipEntry.entryName.split("/")[1]}`, false, true);
    }
});

const execFile = require('child_process').execFile;
var tscPath = 'node_modules/.bin/tsc';
if(process.platform = "win32"){
    tscPath += ".cmd";
}
const child = execFile(tscPath.replace(/\//g, path.sep),[], (error, stdout, stderr)=> {
    if(error){
        throw error;
    }
    console.log(stdout);
});
