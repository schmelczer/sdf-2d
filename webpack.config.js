const path = require('path');
const TerserJSPlugin = require('terser-webpack-plugin');

const isProduction = process.env.NODE_ENV == 'production';
const isDevelopment = !isProduction;

module.exports = {
  devtool: 'inline-source-map',
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
  plugins: [],
  entry: {
    main: './src/main.ts',
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
        test: /\.(woff2?|ttf|eot|svg)(?:[?#].+)?$/,
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'static/fonts/',
          },
        },
        include: /fonts/,
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
    extensions: ['.ts', '.js', '.glsl'],
  },
  output: {
    filename: '[name]-bundle.js',
    path: path.resolve(__dirname, 'build'),
  },
};
