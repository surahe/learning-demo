const { AsyncSeriesHook } = require("tapable");

// 创建实例
let asyncSeriesHook = new AsyncSeriesHook(["name", "age"]);

// 注册事件
// console.time("time");
// asyncSeriesHook.tapAsync("1", (name, age, next) => {
//     setTimeout(() => {
//         console.log("1", name, age, new Date());
//         next();
//     }, 1000);
// });

// asyncSeriesHook.tapAsync("2", (name, age, next) => {
//     setTimeout(() => {
//         console.log("2", name, age, new Date());
//         next();
//     }, 2000);
// });

// asyncSeriesHook.tapAsync("3", (name, age, next) => {
//     setTimeout(() => {
//         console.log("3", name, age, new Date());
//         next();
//         console.timeEnd("time");
//     }, 3000);
// });

// // 触发事件，让监听函数执行
// asyncSeriesHook.callAsync("panda", 18, () => {
//     console.log("complete");
// });


// 注册事件
console.time("time");
asyncSeriesHook.tapPromise("1", (name, age) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("1", name, age, new Date());
      resolve("1");
    }, 1000);
  });
});

asyncSeriesHook.tapPromise("2", (name, age) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("2", name, age, new Date());
      resolve("2");
    }, 2000);
  });
});

asyncSeriesHook.tapPromise("3", (name, age) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log("3", name, age, new Date());
      resolve("3");
      console.timeEnd("time");
    }, 3000);
  });
});

// 触发事件，让监听函数执行
asyncSeriesHook.promise("panda", 18).then(ret => {
  console.log(ret);
});

// 1 panda 18 2019-05-19T15:21:44.485Z
// 2 panda 18 2019-05-19T15:21:46.504Z
// 3 panda 18 2019-05-19T15:21:49.506Z
// time: 6025.957ms
// undefined