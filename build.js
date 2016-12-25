const fs = require('fs');
const path = require("path");
const ncp = require("ncp");
const browserify = require('browserify');

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

execFile(tscPath.replace(/\//g, path.sep), [], (error, stdout, stderr) => {
    console.log("TS files compiled");
    if (error) {
        console.error(`Failed to compile typescript files :\n ${error} \n ${stdout} \n ${stderr}`);
        return;
    }
    fs.writeFileSync(`${__dirname}/lib/client/loadPlugins.js`, "");
    let files = fs.readdirSync(`${__dirname}/lib/client/plugins`);
    files.forEach(function (file) {
        fs.appendFileSync(`${__dirname}/lib/client/loadPlugins.js`, `require("./plugins/${file}");\n`);
    });
    fs.writeFileSync(`${__dirname}/lib/client/loadParsers.js`, "");
    files = fs.readdirSync(`${__dirname}/lib/client/parsers`);
    files.forEach(function (file) {
        fs.appendFileSync(`${__dirname}/lib/client/loadParsers.js`, `require("./parsers/${file}");\n`);
    });

    let wS = fs.createWriteStream(`${__dirname}/cordova/www/bundle.js`);
    let b = browserify({standalone: "App"});
    b.add(`${__dirname}/client.js`);
    b.bundle().pipe(wS);

    ncp(`${__dirname}/lib`, `${__dirname}/cordova/www/lib`, function (err) {
        if (err) {
            return console.error(err);
        }
        console.log("Lib files distributed to cordova");
    });
});

const less = require('less');
//Style for electron
fs.writeFileSync(`${lessFilesPath}/imports/platform.less`, "@titleBarMargin: 1.5em;");
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
    ncp(`${__dirname}/static`, `${__dirname}/cordova/www/static`, function (err) {
        if (err) {
            return console.error(err);
        }
        //Style for cordova
        fs.writeFileSync(`${lessFilesPath}/imports/platform.less`, "@titleBarMargin: 0;");
        let lessFile = fs.readFileSync(`${lessFilesPath}/app.less`).toString();
        less.render(lessFile, {
            paths: [`${lessFilesPath}`, `${lessFilesPath}/imports`],
            compress: true
        }, function (error, output) {
            if (error) {
                return console.error(error);
            }
            fs.writeFileSync(`${__dirname}/cordova/www/static/css/app.css`, output.css);
            console.log("Less files compiled for cordova");
        });
    });

});

ncp(`${__dirname}/index.html`, `${__dirname}/cordova/www/index.html`, function (err) {
    if (err) {
        return console.error(err);
    }
    fs.appendFileSync(`${__dirname}/cordova/www/index.html`, "<script src='cordova.js'></script>");
    console.log("index.html adapted for cordova");
});

try {
    fs.mkdirSync(`${__dirname}/cordova/www/node_modules/`);
} catch (e) {
}
try {
    fs.mkdirSync(`${__dirname}/cordova/www/node_modules/materialize-css/`);
} catch (e) {
}
try {
    fs.mkdirSync(`${__dirname}/cordova/www/node_modules/jquery/`);
} catch (e) {
}
try {
    fs.mkdirSync(`${__dirname}/cordova/www/node_modules/material-design-icons`);
} catch (e) {
}


ncp(`${__dirname}/node_modules/materialize-css/dist`, `${__dirname}/cordova/www/node_modules/materialize-css/dist`, function (err) {

});

ncp(`${__dirname}/node_modules/jquery/dist`, `${__dirname}/cordova/www/node_modules/jquery/dist`, function (err) {

});


ncp(`${__dirname}/node_modules/material-design-icons/iconfont`, `${__dirname}/cordova/www/node_modules/material-design-icons/iconfont`, function (err) {

});