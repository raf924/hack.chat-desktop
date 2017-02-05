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
            exclude: /(tools|cordova)/,
            use: ExtractTextPlugin.extract({
                loader: 'css-loader',
                options: {
                    sourceMap: true
                }
            })
        }, {
            test: /\.(png|woff(2)?|eot|ttf|svg)(\?[a-z0-9=\.]+)?$/,
            loader: 'file-loader?name=[name].[ext]&publicPath=../fonts/&outputPath=static/fonts/',
        },{
            test: /index\.html$/,
            loader: 'file-loader?name=[name].[ext]'
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
