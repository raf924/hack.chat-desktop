let webpack = require('webpack');
module.exports = {
    entry: './client.js',
    output: {
        path: './cordova/www',
        filename: 'bundle.js'
    },
    plugins: [
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    ]
};
