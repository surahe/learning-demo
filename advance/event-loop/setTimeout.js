setTimeout(() => {
  console.log('setTimeout')
  setTimeout(() => {
    console.log('setTimeout 里面的 setTimeout')
  }, 0)
  setImmediate(() => {
    console.log('setTimeout 里面的 setImmediate')
  })
}, 0);

// setTimeout
// setTimeout 里面的 setImmediate
// setTimeout 里面的 setTimeout