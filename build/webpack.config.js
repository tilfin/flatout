const path = require("path");

const rootDir = path.resolve(__dirname, '..');

module.exports = {
  cache: true,
  entry: {
    'flatout': `${rootDir}/src/flatout.js`
  },
  output: {
    path: `${rootDir}/dist`,
    filename: "[name].js",
    sourceMapFilename: "[name].map",
    library: 'flatout'
  },
  devtool: "#source-map",
  resolve: {
    extensions: ['.js'],
    modules: [path.join(__dirname, 'src'), 'node_modules']
  }
}
