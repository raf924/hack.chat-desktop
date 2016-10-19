const execFile = require('child_process').execFile;
const path = require('path');
var electronPath = 'node_modules/.bin/electron';
if(process.platform == "win32"){
    electronPath += ".cmd";
}
const child = execFile(electronPath.replace(/\//g, path.sep),["."], (error, stdout, stderr)=> {
        if(error){
            throw error;
        }
        console.log(stdout);
});
