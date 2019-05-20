// SyncHook 钩子的使用
const { SyncHook } = require('tapable')

// 创建实例
let syncHook = new SyncHook(['name', 'age'])

// 注册事件
syncHook.tap('1', (name, age) => console.log('1', name, age))
syncHook.tap('2', (name, age) => console.log('2', name, age))
syncHook.tap('3', (name, age) => console.log('3', name, age))

// 注册一个拦截器
syncHook.intercept({
  // 当你的钩子触发之前,(就是call()之前),就会触发这个函数,你可以访问钩子的参数
  // 多个钩子执行一次
  call: (name, age) => {
    console.log('---------------call start---------------')
    console.log(name, age);
    console.log('---------------call end-----------------\n\n')
  },
  // 每个钩子执行之前(多个钩子执行多个),就会触发这个函数
  tap: (tap) => {
    console.log('---------------tap start---------------')
    console.log(tap)
    console.log('---------------tap end---------------\n\n')
  },
  // 每添加一个Tap都会触发 你interceptor上的register,你下一个拦截器的register 函数得到的参数 取决于你上一个register返回的值
  // 所以你最好返回一个 tap 钩子
  register: (tapInfo) => {
    console.log('---------------register start---------------')
    console.log(tapInfo);
    console.log('---------------register end---------------\n\n')
    return tapInfo; // may return a new tapInfo object
  }
})

// 触发事件，让监听函数执行
syncHook.call('panda', 18)
// 1 panda 18
// 2 panda 18
// 3 panda 18