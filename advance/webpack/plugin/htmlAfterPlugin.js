// webpack 插件是一个具有 apply 方法的 JavaScript 对象。
// apply 方法会被 webpack compiler 调用，并且 compiler 对象可在整个编译生命周期访问。

const pluginName = 'ConsoleLogOnBuildWebpackPlugin';

class ConsoleLogOnBuildWebpackPlugin {
  apply(compiler) {
    compiler.hooks.compilation.tap(pluginName, compilation => {
      console.log('webpack 构建过程开始！');
      // html-webpack-plugin-before-html-processing
      compilation.hooks.htmlWebpackPluginBeforeHtmlProcessing.tap(pluginName, htmlPluginData => {
        const result = htmlPluginData.assets.js
        let _html = htmlPluginData.html
        console.log('结果', result)
        _html = _html.replace('<!-- injectjs -->', `<script src="/${result}"></script>`)
        htmlPluginData.html = _html
      })
    });
  }
}
// compiler hook 的 tap 方法的第一个参数，应该是驼峰式命名的插件名称。
// 建议为此使用一个常量，以便它可以在所有 hook 中复用。

module.exports = ConsoleLogOnBuildWebpackPlugin