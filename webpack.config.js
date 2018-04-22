var HardSourceWebpackPlugin = require('hard-source-webpack-plugin');

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
  plugins: [
    new HardSourceWebpackPlugin()
  ],
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
