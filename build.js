const fs = require('fs');
const path = require("path");
let webpack = null;
try {
    webpack = require('webpack');
} catch (e) {

}

const execFile = require('child_process').execFile;
let tscPath = `${__dirname}/node_modules/.bin/tsc`;
let lessFilesPath = `${__dirname}/src/less`;
let cssFilesPath = `${__dirname}/static/css`;
if (process.platform == "win32") {
    tscPath += ".cmd";
}

try {
    fs.mkdirSync(`${__dirname}/cordova/www`);
} catch (e) {

}

let copySync = function (src, dest) {
    fs.writeFileSync(dest, fs.readFileSync(src));
};

let tryPacking = function (arr, idx) {
    if (arr.length === idx + 1 && webpack !== null) {
        webpack(require(`${__dirname}/webpack.config`), function (err, stats) {
            if (err) {
                console.error(err);
                process.exit();
            }
            console.log("Program bundled for cordova");
        });
    }
};

execFile(path.resolve(tscPath), [], (error, stdout, stderr) => {
    console.log("TS files compiled");
    if (error) {
        console.error(`Failed to compile typescript files :\n ${error} \n ${stdout} \n ${stderr}`);
        return;
    }

    let copyToolStyle = function (tool) {
        copySync(`${__dirname}/src/client/modules/tools/${tool}/${tool}.css`, `${__dirname}/lib/client/modules/tools/${tool}/${tool}.css`);
    };
    let logins = fs.readdirSync(`${__dirname}/src/client/modules/login`);
    logins.forEach(function (login) {
        copySync(`${__dirname}/src/client/modules/login/${login}/${login}.html`, `${__dirname}/lib/client/modules/login/${login}/${login}.html`);
    });
    let tools = fs.readdirSync(`${__dirname}/src/client/modules/tools`);
    tools.forEach(function (tool, idx) {
        copySync(`${__dirname}/src/client/modules/tools/${tool}/${tool}.html`, `${__dirname}/lib/client/modules/tools/${tool}/${tool}.html`);
        let toolLess = fs.readFileSync(`${__dirname}/src/client/modules/tools/${tool}/${tool}.less`);
        if (toolLess == null) {
            copyToolStyle(tool);
            tryPacking(tools, idx);
        } else {
            less.render(toolLess.toString(), function (error, output) {
                if (error) {
                    return console.error(error);
                }
                fs.writeFileSync(`${__dirname}/lib/client/modules/tools/${tool}/${tool}.css`, output.css);
                tryPacking(tools, idx);
            });
        }
    });
});

const less = require('less');
let lessFile = fs.readFileSync(`${lessFilesPath}/app.less`).toString();
less.render(lessFile, {
    paths: [`${lessFilesPath}`, `${lessFilesPath}/imports`],
    compress: true
}, function (error, output) {
    console.log("Less files compiled for electron");
    if (error) {
        return console.error(error);
    }
    fs.writeFileSync(`${cssFilesPath}/app.css`, output.css);
    try {
        fs.mkdirSync(`${__dirname}/cordova/www/static`);
    } catch (e) {

    }
});