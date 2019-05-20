const {
  SyncWaterfallHook,
} = require("tapable");


let syncWaterfallHook = new SyncWaterfallHook(['name', 'age']);

syncWaterfallHook.tap('2', (name, age) => {
  console.log(name, age)
  return {
    name,
    age
  }
})

syncWaterfallHook.tap('3', data => {
  console.log(data)
  return 666
})


let ret = syncWaterfallHook.call("suwa", 18);
console.log("call", ret);
// suwa 18
// { name: 'suwa', age: 18 }
// call 666