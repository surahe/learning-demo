/**
 * child_process.fork(modulePath[, args][, options])
 */

var child_process = require('child_process');
var {resolve} = require('path')

// 例子一：会打印出 output from the child
// 默认情况，silent 为 false，子进程的 stdout 等
// 从父进程继承
child_process.fork(resolve(__dirname, 'child/child.js'), {
    silent: false
});




// 例子二：silent 为 true，子进程的 stdout 等
// pipe 向父进程
var child = child_process.fork(resolve(__dirname, 'child/child.js'), {
    silent: true
});

child.stdout.setEncoding('utf8');
child.stdout.on('data', function(data){
    console.log(data);
});
