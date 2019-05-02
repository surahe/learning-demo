/**
 * 
 * 1：为什么在同一个Node版本下，setTimeout和setTimeout的出现顺序不一样
 *   首先进入timer阶段，如果我们的机器性能一般，那么进入timer阶段时，
 *   1毫秒可能已经过去了（setTimeout(fn, 0) 等价于setTimeout(fn, 1)），那么setTimeout的回调会首先执行。
 *   如果没到一毫秒，那么我们可以知道，在check阶段，setImmediate的回调会先执行。
 * 
 * 2：为什么Node 10.13.0和11.12.0中 process.nextTick 回调出现的位置不一样
 * node 11在timer阶段的setTimeout,setInterval...和在check阶段的immediate都在node11里面都修改为一旦执行一个阶段里的一个任务就立刻执行微任务队列
 * 参考 https://juejin.im/post/5c3e8d90f265da614274218a
 */
setImmediate(() => {console.log('[阶段3.immediate] immediate 回调1')})
setImmediate(() => {console.log('[阶段3.immediate] immediate 回调2')})
setImmediate(() => {console.log('[阶段3.immediate] immediate 回调3')})

setTimeout(() => {console.log('[阶段1...定时器回调] 定时器 回调1')}, 0);
setTimeout(() => {
  console.log('[阶段1...定时器回调] 定时器 回调5')
  process.nextTick(() => {
    console.log('[...待切入下一阶段] nextTick 回调2')
  })
}, 0);
setTimeout(() => {console.log('[阶段1...定时器回调] 定时器 回调3')}, 0);
setTimeout(() => {console.log('[阶段1...定时器回调] 定时器 回调4')}, 0);