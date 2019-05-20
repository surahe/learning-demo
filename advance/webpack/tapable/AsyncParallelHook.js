// AsyncParallelHook 钩子：tapAsync/callAsync 的使用
const { AsyncParallelHook } = require("tapable");

// 创建实例
let asyncParallelHook = new AsyncParallelHook(["name", "age"]);

// 注册事件
// console.time("time");
// asyncParallelHook.tapAsync("1", (name, age, done) => {
//   setTimeout(() => {
//     console.log("1", name, age, new Date());
//     done();
//     console.log(11111111)
//   }, 1000);
// });

// asyncParallelHook.tapAsync("2", (name, age, done) => {
//   setTimeout(() => {
//     console.log("2", name, age, new Date());
//     done();
//     console.log(22222222)
//   }, 2000);
// });

// asyncParallelHook.tapAsync("3", (name, age, done) => {
//   setTimeout(() => {
//     console.log("3", name, age, new Date());
//     done();
//     console.timeEnd("time");
//   }, 3000);
// });

// // 触发事件，让监听函数执行
// asyncParallelHook.callAsync("panda", 18, () => {
//   console.log("complete");
// });

// 1 panda 18 2019-05-19T13:29:59.856Z
// 11111111
// 2 panda 18 2019-05-19T13:30:00.893Z
// 22222222
// 3 panda 18 2019-05-19T13:30:01.880Z
// complete
// time: 3072.486ms


/**
 * 
 * promise
 * 
 */
// 注册事件
console.time("time");
asyncParallelHook.tapPromise("1", (name, age) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("1", name, age, new Date());
      resolve("1");
    }, 1000);
  });
});

asyncParallelHook.tapPromise("2", (name, age) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("2", name, age, new Date());
      resolve("2");
    }, 2000);
  });
});

asyncParallelHook.tapPromise("3", (name, age) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("3", name, age, new Date());
      resolve("3");
      console.timeEnd("time");
    }, 3000);
  });
});

// 触发事件，让监听函数执行
asyncParallelHook.promise("panda", 18).then(ret => {
  console.log(ret);
});