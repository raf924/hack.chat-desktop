const execFile = require('child_process').execFile;
const path = require('path');
var electronPath = 'node_modules/.bin/electron';
if (process.platform == "win32") {
    electronPath += ".cmd";
}
let args = ['.'];
if (process.argv[2] === "dev") {
    args.push("dev");
}

const child = execFile(electronPath.replace(/\//g, path.sep), args, (error, stdout, stderr) => {
    if (error) {
        throw error;
    }
    console.log(stdout);
});
