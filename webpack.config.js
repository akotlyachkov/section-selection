const webpack = require('webpack'),
    _ = require('lodash'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    path = require('path');

const baseConfig = {
    entry: {
        app: './src/index.ts'
    },
    output: {
        filename: './debug/section-selection.js',
        library: 'SectionSelection',
        libraryTarget: 'umd'
    },
    externals: {
        jquery: {
            commonjs: "jquery",
            commonjs2: "jquery",
            amd: "jquery",
            root: "$"
        }
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                loaders: [{
                    loader: 'awesome-typescript-loader',
                    options: {
                        transpileOnly: true
                    }
                }],
                exclude: /node_modules/
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        {loader: 'css-loader', options: {minimize: true, sourceMap: false}},
                        {loader: 'sass-loader', options: {sourceMap: false, sourceMapContents: false}}
                    ],
                })
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin('./debug'),
        new ExtractTextPlugin('./debug/section-selection.css')
    ],
    resolve: {
        extensions: ['.ts', '.scss', '.html', '.js', '.css']
    },
    node: {
        fs: 'empty'
    },
    devtool: 'source-map'
};

const minConfig = _.cloneDeep(baseConfig);

minConfig.output.filename = './release/section-selection.js';
minConfig.plugins = [
    new CleanWebpackPlugin('./release'),
    new ExtractTextPlugin('./release/section-selection.css'),
    new webpack.optimize.UglifyJsPlugin()
];
minConfig.devtool = false;

module.exports = [baseConfig, minConfig];