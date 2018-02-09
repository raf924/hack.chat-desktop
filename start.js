const execFile = require('child_process').execFile;
const path = require('path');
let electronPath = 'node_modules/.bin/electron';
if (process.platform === "win32") {
    electronPath += ".cmd";
}
let args = ['./electron/main.js'];
if (process.argv[2] === "dev") {
    args.push("dev");
}

execFile(path.resolve(electronPath), args, (error, stdout, stderr) => {
    if (error) {
        throw error;
    }
    console.log(stdout);
});
