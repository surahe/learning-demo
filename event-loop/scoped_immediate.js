// 1.  多次调用`setImmediate()`则把回调都放入队列，在 check 阶段都会执行；
// 2.  但`setImmediate()`回调里调用`setImmediate()`，则放到下次 event loop。

setImmediate(function(){
  console.log("setImmediate");
  setImmediate(function(){
    console.log("嵌套setImmediate");
  });
  process.nextTick(function(){
    console.log("nextTick")
  })
})
setImmediate(function(){
  console.log("setImmediate2");
});

// Node 10以下
// setImmediate
// setImmediate2（Node 10以下会输出到这里）
// nextTick
// 嵌套setImmediate

// Node 11
// setImmediate
// nextTick
// setImmediate2（Node 11会输出到这里）
// 嵌套setImmediate