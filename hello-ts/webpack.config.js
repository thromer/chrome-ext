const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',  // not needed to get .js.map
  entry: {
    'background': './src/js/background.ts',
    // 'options': './src/html/options.html',
    // 'popup': './src/html/popup.html'
    'oauth': './src/js/oauth.ts',
    'options': './src/js/options.ts',
    'popup': './src/js/popup.ts'
  },
  devtool: 'inline-source-map',  // needed to get .js.map
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',  // WebPack not obvious to me anyway
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new CopyPlugin({
      patterns: [
	"src/html/options.html",
	"src/html/popup.html",
	"src/manifest.json",
	"src/styles/button.css",
	{from: "src/images", to: "images"},  // works
      ]})
  ],
}
