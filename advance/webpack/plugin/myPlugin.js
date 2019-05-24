// @file: plugins/myplugin.js
const pluginName = 'MyPlugin'
// tapable是webpack自带的package，是webpack的核心实现
// 不需要单独install，可以在安装过webpack的项目里直接require
// 拿到一个同步hook类
const { SyncHook } = require("tapable");
class MyPlugin {
  // 传入webpack config中的plugin配置参数
  constructor(options) {
    // { test: 1 }
    console.log('@plugin constructor', options);
  }

  apply(compiler) {
    console.log('@plugin apply');
    // 实例化自定义事件
    compiler.hooks.myPlugin = new SyncHook(['data'])

    compiler.hooks.environment.tap(pluginName, () => {
      //广播自定义事件
      compiler.hooks.myPlugin.call("It's my plugin.")
      console.log('@environment');
    });

    // compiler.hooks.compilation.tap(pluginName, (compilation) => {
    // 你也可以在compilation上挂载hook
    // compilation.hooks.myPlugin = new SyncHook(['data'])
    // compilation.hooks.myPlugin.call("It's my plugin.")
    // });
  }
}
module.exports = MyPlugin
