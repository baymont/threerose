var webpack = require('webpack');

module.exports = {
  entry: {
    'bframe': './src/index.ts',
    'bframe.min': './src/index.ts',
    'test': './src/_www/test.tsx'
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  output: {
    path: __dirname + "/_bundles",
    filename: "[name].js",
    libraryTarget: 'umd',
    library: 'bframe',
    umdNamedDefine: true
  },
  externals: {
    'babylonjs': 'BABYLON'
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loader: 'awesome-typescript-loader',
        exclude: /node_modules/,
        query: {
          declaration: false,
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
        include: /\.min\.js$/,
      })
  ]
};