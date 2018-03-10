var webpack = require('webpack');

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  output: {
    path: __dirname + '/dist',
    filename: '[name].js',
    libraryTarget: 'umd',
    library: 'nucleus3d',
    umdNamedDefine: false
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
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'awesome-typescript-loader',
          query: {
            declaration: false
          }
        }
      }
    ]
  }
};
