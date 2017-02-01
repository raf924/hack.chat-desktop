const fs = require('fs');
const path = require("path");
const ncp = require("ncp");
const webpack = require('webpack');

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
    fs.writeFileSync(`${__dirname}/lib/client/loadPlugins.js`, "module.exports = [];\n");
    let files = fs.readdirSync(`${__dirname}/lib/client/plugins`);
    files.forEach(function (file) {
        fs.appendFileSync(`${__dirname}/lib/client/loadPlugins.js`, `module.exports.push("${file}");\n`);
    });
    fs.writeFileSync(`${__dirname}/lib/client/loadParsers.js`, "module.exports = [];\n");
    files = fs.readdirSync(`${__dirname}/lib/client/parsers`);
    files.forEach(function (file) {
        fs.appendFileSync(`${__dirname}/lib/client/loadParsers.js`, `module.exports.push("${file}");\n`);
    });

    fs.writeFileSync(`${__dirname}/lib/client/loadTools.js`, "module.exports = [];\n");
    files = fs.readdirSync(`${__dirname}/lib/client/tools`);
    files.forEach(function (file) {
        fs.appendFileSync(`${__dirname}/lib/client/loadTools.js`, `module.exports.push("${file}");\n`);
    });

    let copyToolStyle = function (tool) {
        ncp(`${__dirname}/src/client/tools/${tool}/${tool}.css`, `${__dirname}/lib/client/tools/${tool}/${tool}.css`, function (err) {

        });
    };

    let tools = fs.readdirSync(`${__dirname}/src/client/tools`);
    tools.forEach(function (tool) {
        ncp(`${__dirname}/src/client/tools/${tool}/${tool}.html`, `${__dirname}/lib/client/tools/${tool}/${tool}.html`, function (err) {

        });
        let toolLess = fs.readFileSync(`${__dirname}/src/client/tools/${tool}/${tool}.less`).toString();
        if (toolLess == null) {
            copyToolStyle(tool);
        } else {
            less.render(toolLess, function (error, output) {
                if (error) {
                    return console.error(error);
                }
                fs.writeFileSync(`${__dirname}/lib/client/tools/${tool}/${tool}.css`, output.css);
            });
        }
    });
    webpack(require(`${__dirname}/webpack.config`), function (err, stats) {
        if (err) {
            console.error(err);
            process.exit();
        }
        console.log("Program bundled for cordova");
    });
})
;

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


ncp(`${__dirname}/node_modules/material-design-icons/iconfont`, `${__dirname}/cordova/www/node_modules/material-design-icons/iconfont`, function (err) {

});

ncp(`${__dirname}/node_modules/roboto-fontface/css/roboto`, `${__dirname}/cordova/www/node_modules/roboto-fontface/css/roboto`, function (err) {

});
ncp(`${__dirname}/node_modules/roboto-fontface/fonts/Roboto`, `${__dirname}/cordova/www/node_modules/roboto-fontface/fonts/Roboto`, function (err) {

});