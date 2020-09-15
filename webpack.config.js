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
    'sdf-2d': [PATHS.entryPoint],
    'sdf-2d.min': [PATHS.entryPoint],
  },
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
    minimizer: [
      new TerserJSPlugin({
        sourceMap: isDevelopment,
        cache: true,
        test: /\.ts$/i,
        terserOptions: {
          ecma: 5,
          warnings: true,
          parse: {},
          compress: { defaults: true },
          mangle: true,
          module: false,
          output: null,
          toplevel: true,
          nameCache: null,
          ie8: false,
          keep_classnames: false,
          keep_fnames: false,
          safari10: false,
        },
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
          loader: 'awesome-typescript-loader',
        },
        exclude: /node_modules/,
      },
    ],
  },
};
