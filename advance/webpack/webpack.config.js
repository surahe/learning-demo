const path = require('path')
const ConsoleLogOnBuildWebpackPlugin = require('./plugin/FirstPlugin')
const MyPlugin = require('./plugin/myPlugin.js')
const Listen4Myplugin = require('./plugin/listen4myplugin.js')

module.exports = {
  entry: path.resolve(__dirname, 'src/index.js'),
  mode: 'development',
  module: {
    // rules: [
    //   {
    //     test: /\.js$/,
    //     loader: path.resolve(__dirname, './loader/asyncLoader.js'),
    //     options: {
    //       test: 123,
    //       foo: 'aa'
    //     }
    //   }
    // ]
  },
  plugins: [
    // new ConsoleLogOnBuildWebpackPlugin({
    //   data: 1
    // }),
    // new MyPlugin("Plugin is instancing."),
    // new Listen4Myplugin()
  ]
}