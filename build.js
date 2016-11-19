const fs = require('fs');
const path = require("path");

const execFile = require('child_process').execFile;
var tscPath = 'node_modules/.bin/tsc';
var lesscPath = 'node_modules/.bin/lessc';
const lessFilesPath = `${__dirname}/src/less`;
const cssFilesPath = `${__dirname}/static/css`;
const lessRegex = /\.less/i;
if (process.platform == "win32") {
    tscPath += ".cmd";
    lesscPath += ".cmd";
}
execFile(tscPath.replace(/\//g, path.sep), [], (error, stdout, stderr) => {
    if (error) {
        console.error(`Failed to compile typescript files :\n ${error} \n ${stdout} \n ${stderr}`);
        return;
    }
    console.log("TS files compiled");
});
fs.readdir(`${__dirname}/src/less`, function (err, files) {
    files.forEach(function (file) {
        if (lessRegex.test(file)) {
            execFile(lesscPath.replace(/\//g, path.sep), [`${lessFilesPath}/${file}`, `${cssFilesPath}/${file.replace(lessRegex, ".css")}`], (error, stdout, stderr) => {
                if (error) {
                    console.error(`Failed to compile ${lessFilesPath}/${file} :\n ${stderr}`);
                    return;
                }
                console.log(`${lessFilesPath}/${file} -> ${cssFilesPath}/${file.replace(lessRegex, ".css")}`);
            });
        }
    });
});
