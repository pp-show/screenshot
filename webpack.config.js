const path = require('path');
const { VueLoaderPlugin } = require('vue-loader')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
// ['./src/main.js', './src/content/content.js']
module.exports = {
  mode: "development",
  entry: {
    main: './src/main.js',
    background: './src/background.js',
    content: './src/content/content.js'
  },
  output: {
    path: path.resolve(__dirname, 'screentshot'),
    filename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /\.scss|\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      }
    ],
  },
  devServer: {
    hot: true,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: 'public/popup.html',
      filename: 'popup.html',
      excludeChunks: ['content', 'background']
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'public/manifest.json', to: 'manifest.json' },
        { from: 'public/16.png', to: '16.png' },
        { from: 'public/48.png', to: '48.png' },
        { from: 'public/128.png', to: '128.png' },
      ]
    }),
  ]
};
