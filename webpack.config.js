const HtmlWebpackPlugin = require('html-webpack-plugin'); //

const path = require('path');

const mode ='development';
const prod = mode === 'production';

module.exports = {
    mode: "development",
    entry: {
        bundle: ['./src/main.ts']
    },
    resolve: {
        extensions: [ ".js", ".ts", ".tsx",],
    },
    output: {
        path: __dirname + '/public',
        filename: '[name].js',
        chunkFilename: '[name].[id].js'
    },
    module: {
        rules: [

            {
                test: /\.tsx?$/,
                use: [
                    /*{
                        loader: 'babel-loader',
                       /!* options: {
                            presets: [[
                                "@babel/preset-env",
                            ]]

                        }*!/
                    },*/
                    {loader: "ts-loader"}
                ]
            },


        ]
    },

    plugins: [
        new HtmlWebpackPlugin({template: './index.html'}),
    ],
    devtool: prod ? false: 'source-map'
};
