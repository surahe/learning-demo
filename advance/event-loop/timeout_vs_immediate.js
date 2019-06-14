setTimeout(function timeout () {
  console.log('timeout');
},0);

setImmediate(function immediate () {
  console.log('immediate');
});

// timeout
// immediate
// 或
// immediate
// timeout