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

let copySync = function (src, dest) {
    fs.writeFileSync(dest, fs.readFileSync(src));
};

let tryPacking = function (arr, idx) {
    if (arr.length === idx + 1) {
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