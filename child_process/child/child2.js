


console.log('child 1')

process.on('message', function(m){
  console.log('child event 1')
  console.log('message from parent: ' + JSON.stringify(m))
  console.log('child event 2')
});

console.log('child 2')

process.send({from: 'child'})

console.log('child 3')