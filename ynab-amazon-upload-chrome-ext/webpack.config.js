const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',  // not needed to get .js.map
  entry: {
    'popup': './src/popup.ts'
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
	{from: "src/manifest.json", to: "manifest.json"},
	{from: "src/popup.html", to: "popup.html"},
	{from: "src/images", to: "images"},
      ]})
  ],
}

// Local Variables:
// compile-command: "npx webpack"
// End:
