const fs = require('fs')

fs.readFile(__filename, () => {
  console.log('readFile')
  setTimeout(() => {
    console.log('readFile  timeout')
  }, 0)
  setImmediate(() => {
    console.log('readFile  immediate')
  })
  fs.readFile(__filename, () => {
    console.log('readFile  readFile')
  })
})

setImmediate(() => {
  console.log('immediate')
})

setTimeout(() => {
  console.log('timeout')
}, 0)

// setTimeout(() => {
//   console.log('setImmediate')
//   setTimeout(() => {
//     console.log('setImmediate 里面的 setTimeout')
//   }, 0)
//   setImmediate(() => {
//     console.log('setImmediate 里面的 setImmediate')
//   })
// }, 0);