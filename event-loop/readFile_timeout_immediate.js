/**
 * 为什么fs.readFile回调里设置的，setImmediate始终先执行？
 * 因为fs.readFile的回调执行是在 poll 阶段，所以，接下来的 check 阶段会先执行 setImmediate 的回调。
 */

// readFile_ immediate
// readFile_ timeout
const fs = require('fs')
fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log('readFile_ timeout')
  }, 0)
  setImmediate(() => {
    console.log('readFile_ immediate')
  })
})