setImmediate(() => {
  console.log('setImmediate')
  setTimeout(() => {
    console.log('setImmediate 里面的 setTimeout')
  }, 0)
  setImmediate(() => {
    console.log('setImmediate 里面的 setImmediate')
  })
});

// setImmediate
// setImmediate 里面的 setTimeout
// setImmediate 里面的 setImmediate
