/**
 * 1 使用 rules: [{loader: path.resolve(__dirname, './loader/index.js')}]
 * 2 最后的loader最先调用，传入原始的资源
 * 3 中间的loader执行时，传入的值是上一个的结果
 * 4 loader 需要异步 this.async、this.callback
 */

const loaderUtils = require("loader-utils");

module.exports = function(content, map, meta) {
  const options = loaderUtils.getOptions(this);
  console.log('*** js content ***', content)
  console.log('*** map ***', map)
  console.log('*** meta ***', meta)
  console.log('*** pitc h***', this.data)
  console.log('*** options ***', options)
  return content + this.data.value
}

/**
 * 5 前置钩子
 * use['1-loader', '2-loader']
 * 
 * 执行顺序
 * 1-loader-pitch
 * 2-loader-pitch
 * 2-loader
 * 1-loader
 */
module.exports.pitch = function(remainRequest, preRequest, data) {
  data.value= '123'
}

