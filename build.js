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

execFile(path.resolve(tscPath), [], (error, stdout, stderr) => {
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
    fs.writeFileSync(`${__dirname}/lib/client/loadLogin.js`, "");
    files = fs.readdirSync(`${__dirname}/lib/client/login`);
    files.forEach(function (file) {
        //TODO: find something better to name modules
        fs.appendFileSync(`${__dirname}/lib/client/loadLogin.js`, `module.exports.${file.split(".js")[0]} = require("./login/${file}");\n`);
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
    });
});

ncp(`${__dirname}/index.html`, `${__dirname}/cordova/www/index.html`, function (err) {
    if (err) {
        return console.error(err);
    }
    console.log("index.html loaded for cordova");
});

try {
    fs.mkdirSync(`${__dirname}/cordova/www/node_modules/`);
} catch (e) {
}
try {
    fs.mkdirSync(`${__dirname}/cordova/www/node_modules/material-components-web/`);
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
try {
    fs.mkdirSync(`${__dirname}/cordova/www/node_modules/roboto-fontface`);
} catch (e) {
}
try {
    fs.mkdirSync(`${__dirname}/cordova/www/node_modules/roboto-fontface/css`);
} catch (e) {
}
try {
    fs.mkdirSync(`${__dirname}/cordova/www/node_modules/roboto-fontface/fonts`);
} catch (e) {
}

ncp(`${__dirname}/node_modules/material-components-web/dist`, `${__dirname}/cordova/www/node_modules/material-components-web/dist`, function (err) {

});

ncp(`${__dirname}/node_modules/jquery/dist`, `${__dirname}/cordova/www/node_modules/jquery/dist`, function (err) {

});


ncp(`${__dirname}/node_modules/material-design-icons/iconfont`, `${__dirname}/cordova/www/node_modules/material-design-icons/iconfont`, function (err) {

});

ncp(`${__dirname}/node_modules/roboto-fontface/css/roboto`, `${__dirname}/cordova/www/node_modules/roboto-fontface/css/roboto`, function (err) {

});
ncp(`${__dirname}/node_modules/roboto-fontface/fonts/Roboto`, `${__dirname}/cordova/www/node_modules/roboto-fontface/fonts/Roboto`, function (err) {

});