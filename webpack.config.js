const webpack = require('webpack');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
module.exports = {
    entry: {
        main: `${__dirname}/client.js`,
        static: `${__dirname}/static.js`
    },
    output: {
        path: `${__dirname}/cordova/www`,
        filename: 'bundle.js'
    },
    module: {
        rules: [{
            test: /\.css$/,
            exclude: /(node_modules|tools|cordova)/,
            use: ExtractTextPlugin.extract({
                loader: 'css-loader',
                options: {
                    sourceMap: true
                }
            })
        }]
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin(),
        new ExtractTextPlugin(`static/css/app.css`)
    ],
    externals: {
        titlebar: "null"
    },
    node: {
        fs: "empty",
        titlebar: "empty"
    }
};
