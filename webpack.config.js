'use strict';

if(~process.argv.indexOf('--prod')) {
    process.env.NODE_ENV = 'production';
} else {
    process.env.NODE_ENV = 'development';
}

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const NODE_ENV = process.env.NODE_ENV || 'development';
const outputPath = path.join(__dirname, 'dist/');

module.exports = {
    watch: NODE_ENV === 'development',
    watchOptions: {
        aggregateTimeout: 300
    },

    mode: NODE_ENV,

    performance: {
        maxEntrypointSize: 5000000,
        maxAssetSize: 10000000
    },

    devtool: NODE_ENV === 'development' ? 'cheap-module-eval-source-map' : false,

    entry: {
        main: './frontend/index.tsx'
    },

    output: {
        path: outputPath,
        filename: 'js/[name].[hash].min.js'
    },

    plugins: [

        new webpack.NoEmitOnErrorsPlugin(),

        new CleanWebpackPlugin([outputPath], {
            verbose: true,
            watch: true
        }),

        new HtmlWebpackPlugin({
            template: './frontend/assets/index.html',
            filename: 'index.html'
        }),

        new webpack.DefinePlugin({
            'NODE_ENV': JSON.stringify(NODE_ENV)
        }),

        new ExtractTextWebpackPlugin({
            filename: 'css/[name].[hash].min.css'
        })
    ],

    optimization: {
        splitChunks: {
            cacheGroups: {
                vendors: {
                    test: /[\\/]node_modules[\\/]/,
                    name: "vendors",
                    chunks: "all"
                },
                commons: {
                    name: "commons",
                    chunks: "initial",
                    minChunks: 2
                }
            }
        }
    },

    resolve: {
        extensions: ['.js', '.ts', '.tsx', '.less', '.html', '.json'],
        modules: [
            path.resolve('./frontend'),
            path.resolve('./node_modules')
        ]
    },

    module: {
        rules: [

            {
                test: /\.(ts|tsx)$/,
                use: [
                    {
                        loader: 'awesome-typescript-loader'
                    }
                ]
            },

            {
                test: /\.less$/,
                exclude: /node_modules/,
                use: ['to-string-loader'].concat(ExtractTextWebpackPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        'less-loader'
                    ]
                }))
            },

            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            minimize: true,
                            removeAttributeQuotes: false,
                            caseSensitive: true,
                            customAttrSurround: [ [/#/, /(?:)/], [/\*!/, /(?:)/], [/\[?\(?/, /(?:)/] ],
                            customAttrAssign: [ /\)?\]?=/ ]
                        }
                    }
                ]
            },

            {
                test: /\.(png|jpg|svg|ttf|eot|woff|woff2|ico)(\?.*$|$)$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '../assets/[name].[ext]'
                        }
                    }
                ]
            }
        ]
    }
};

if(NODE_ENV === 'production') {
    module.exports.plugins.push(
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false,
                drop_console: true
            },
            mangle: {
                keep_fnames: true
            }
        })
    );
}
