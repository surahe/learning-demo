/**
 * parent1
 * parent2
 * parent3
 * parent4
 * child 1
 * child 2
 * child 3
 * parent event 1
 * message from child: {"from":"child"}
 * parent event 2
 * child event 1
 * message from parent: {"from":"parent"}
 * child event 2
 */

var child_process = require('child_process')
var { resolve } = require('path')

console.log('parent1')

var child2 = child_process.fork(resolve(__dirname, 'child/child2.js'))

console.log('parent2')

child2.on('message', function (m) {
  console.log('parent event 1')
  console.log('message from child: ' + JSON.stringify(m))
  console.log('parent event 2')
});

console.log('parent3')

child2.send({ from: 'parent' })

console.log('parent4')