const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");

let clientConfig = {
    //devtool: 'inline-source-map',
    target: "electron-renderer",
    entry: {
        main: `${__dirname}/client.ts`,
    },
    output: {
        path: `${__dirname}/www`,
        filename: 'bundle.js'
    },
    resolve: {
        extensions: [".ts", ".js"],
        //modules: [`${__dirname}/src`, `${__dirname}/node_modules`]
    },
    resolveLoader: {
        modules: [`${__dirname}/loaders`, `${__dirname}/node_modules`]
    },
    module: {
        rules: [{
            test: /\.ts$/, loader: "ts-loader"
        }, {
            test: /\.less$/,
            use: "./loaders/less-loader"
        }]
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin(),
        new CopyPlugin([
            //{from: `${__dirname}/bower_components/**/*.+(html|js)`, to: `${__dirname}/www`},
            {from: `${__dirname}/static`, to: `${__dirname}/www/static`},
            {from: `${__dirname}/vendor`, to: `${__dirname}/www/vendor`},
            {from: `${__dirname}/index.html`, to: `${__dirname}/www/index.html`}])
    ],
    node: {
        __dirname: false,
        fs: false
    }
};

let electronConfig = {
    target: "electron-main",
    entry: "./main.js",
    output: {
        path: `${__dirname}/electron`,
        filename: "main.js"
    },
    module: {
        rules: [
            {test: /\.ts$/, loader: "ts-loader"}
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        modules: [`${__dirname}/src`, `${__dirname}/node_modules`]
    },
    plugins: [
        new webpack.optimize.ModuleConcatenationPlugin()
    ],
    node: {
        __dirname: false
    }
};

module.exports = [clientConfig, electronConfig];