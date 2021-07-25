const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: 'development',  // not needed to get .js.map
  entry: {
    'background': './src/js/background.ts',
    'contentScript': './src/js/contentScript.ts',
    'options': './src/js/options.ts',
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
	"src/manifest.json",
	"src/js/preference_manager.js",  // how would i do a pattern? it isn't intuitive. Also maybe webpack inlines this anyway if we import properly?
	{from: "src/js/libdot", to: "libdot"},
	{from: "src/images", to: "images"},
	{from: "src/css", to: "css"},
	{from: "src/html", to: "html"},
      ]})
  ],
}

// Local Variables:
// compile-command: "npx webpack"
// End:
