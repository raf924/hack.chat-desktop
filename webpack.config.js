let webpack = require('webpack');
module.exports = {
    entry: {
        main: './client.js'
    },
    output: {
        path: './cordova/www',
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ],
    externals: {
        titlebar: "null"
    },
    node: {
        fs: "empty",
        titlebar: "empty"
    }
};
