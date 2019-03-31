const path = require("path");

const rootDir = path.resolve(__dirname, '..');

module.exports = {
  cache: true,
  entry: {
    'lfin': `${rootDir}/src/flatout.js`,
    'lfin-view': `${rootDir}/src/lfin-view.js`,
  },
  output: {
    path: `${rootDir}/dist`,
    filename: "[name].js",
    sourceMapFilename: "[name].map",
    library: 'Lfin'
  },
  devtool: "#source-map",
  resolve: {
    extensions: ['.js'],
    modules: [path.join(__dirname, 'src'), 'node_modules']
  }
}
