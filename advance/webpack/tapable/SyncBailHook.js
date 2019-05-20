const {
  SyncBailHook
} = require("tapable");

// 接收一个可选的字符串数组参数
// complier.hooks
let queue = new SyncBailHook(['name', 'age'])

queue.tap('2', function(name, age) {
  console.log(name, age)
})


queue.tap('2', function(name, age) {
  console.log(name, age)
  return 2
})


queue.tap('2', function(name, age) {
  console.log(name, age)
  return 3
})


queue.call('suwa', 5)
// suwa 4
// suwa 6