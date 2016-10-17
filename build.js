const zip = require('adm-zip');
const fs = require('fs');

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
