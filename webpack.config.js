var path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');

var PATHS = {
  entryPoint: path.resolve(__dirname, 'src/main.ts'),
  bundles: path.resolve(__dirname, 'lib'),
};

const isProduction = process.env.NODE_ENV == 'production';
const isDevelopment = !isProduction;

module.exports = {
  entry: {
    main: [PATHS.entryPoint],
  },
  target: 'web',
  output: {
    path: PATHS.bundles,
    filename: '[name].js',
    library: 'SDF2D',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  devtool: 'source-map',
  watchOptions: {
    aggregateTimeout: 600,
    ignored: /node_modules/,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  optimization: {
    minimize: true,
    usedExports: true,
    minimizer: [
      new TerserJSPlugin({
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
};
