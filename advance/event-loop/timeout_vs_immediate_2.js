const now = Date.now();

setTimeout(() => console.log('setTimeout'), 0);
setImmediate(() => console.log('setImmediate'));

// 延迟1秒
while (Date.now() - now < 1000) {
}

// 改为添加一个nextTick函数也可以让setTimeout先执行
// process.nextTick(function(){
//   console.log('nextTick');
// });

// setTimeout
// setImmediate