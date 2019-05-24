/**
 * 创建：webpack在其内部组件创建大量钩子
 * 注册；插件将自己的方法注册到对应的钩子，交给wbepack
 * 调用：webpack编译过程，适时地触发相应的钩子
 * 
 * 流程
 * 初始：启动创建 读取与合并参数，加载plugin，实例化compiler
 * 编译：从entry出发，针对每一个module调用loader 翻译文件内容并找到module依赖 进行编译处理
 * 输出：将编译后的module组合成chunk 将chunk转化为文件 输出到文件系统
 */

const pluginName = 'ConsoleLogOnBuildWebpackPlugin';

class ConsoleLogOnBuildWebpackPlugin {
  apply(compiler) {
    for (var hook of Object.keys(compiler.hooks)) {
      console.log(hook);
    }
    compiler.hooks.run.tap(pluginName, compilation => {
      console.log("\n~~~~~~~我的插件执行~~~~~\n");
    });
  }
}

module.exports = ConsoleLogOnBuildWebpackPlugin