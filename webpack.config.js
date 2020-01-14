const path = require('path');
module.exports = {
  entry: './source/main.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'linter.js'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
      }
    ]
  }
}