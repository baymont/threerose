var webpack = require('webpack');

module.exports = {
    entry: {
        nucleus3d: './src/index.ts',
        'nucleus3d.min': './src/index.ts'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },
    output: {
        path: __dirname + '/dist',
        filename: '[name].js',
        libraryTarget: 'umd',
        library: 'nucleus3d',
        umdNamedDefine: true
    },
    externals: {
        babylonjs: {
            root: 'BABYLON',
            commonjs2: 'babylonjs',
            commonjs: 'babylonjs',
            amd: 'babylonjs'
        }
    },
    devtool: 'source-map',
    module: {
        loaders: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
                exclude: /node_modules/,
                query: {
                    declaration: false
                }
            },
            {
                test: /\.ts$/,
                enforce: 'pre',
                loader: 'tslint-loader',
                options: {
                    emitErrors: false
                }
            }
        ]
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            minimize: true,
            sourceMap: true,
            include: /\.min\.js$/
        })
    ]
};
