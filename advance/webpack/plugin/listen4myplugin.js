class Listen4Myplugin {
  apply(compiler) {
    // 在myplugin environment 阶段被广播
    compiler.hooks.myPlugin.tap('Listen4Myplugin', (data) => {
      console.log('@Listen4Myplugin', data)
    })
  }
}

module.exports = Listen4Myplugin
