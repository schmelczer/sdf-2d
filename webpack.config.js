const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

const PATHS = {
  entryPoint: path.resolve(__dirname, 'src/main.ts'),
  bundles: path.resolve(__dirname, 'lib'),
};

module.exports = {
  entry: {
    main: [PATHS.entryPoint],
  },
  target: 'web',
  output: {
    path: PATHS.bundles,
    filename: '[name].js',
    library: 'sdf-2d',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  devtool: 'source-map',
  watchOptions: {
    aggregateTimeout: 600,
    ignored: /node_modules/,
  },
  externals: {
    'gl-matrix': 'gl-matrix',
    'resize-observer-polyfill': 'resize-observer-polyfill',
  },
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(require('./package.json').version),
    }),
  ],
  optimization: {
    minimize: true,
    usedExports: true,
    minimizer: [
      new TerserJSPlugin({
        sourceMap: true,
        test: /\.js$/i,
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.(glsl)$/,
        use: {
          loader: 'raw-loader',
        },
      },
      {
        test: /\.ts$/,
        use: {
          loader: 'ts-loader',
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
};
