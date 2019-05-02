/**
 * child_process.exec(command[, options][, callback])
 * 创建一个shell，然后在shell里执行命令。执行完成后，将stdout、stderr作为参数传入回调方法。
 * 
 * options 参数说明：
 * cwd：当前工作路径。
 * env：环境变量。
 * encoding：编码，默认是utf8。
 * shell：用来执行命令的shell，unix上默认是/bin/sh，windows上默认是cmd.exe。
 * timeout：默认是0。如果timeout大于0，那么，当子进程运行超过timeout毫秒，那么，就会给进程发送killSignal指定的信号
 * killSignal：默认是SIGTERM。
 * uid：执行进程的uid。
 * gid：执行进程的gid。
 * maxBuffer：标准输出、错误输出最大允许的数据量（单位为字节），如果超出的话，子进程就会被杀死。默认是200*1024
 */

var exec = require('child_process').exec;
// 解决windows命令编码问题 https://ask.csdn.net/questions/167560
var iconv = require('iconv-lite');
var encoding = 'cp936';
var binaryEncoding = 'binary';

// 成功的例子
exec('dir', { encoding: binaryEncoding }, function (error, stdout, stderr) {
  if (error) {
    console.log(iconv.decode('error: ' + error, encoding));
    return;
  }
  console.log(iconv.decode('stdout: ' + stdout, encoding));
  console.log(iconv.decode('stderr: ' + typeof stderr, encoding));
});

// 失败的例子
exec('ls hello.txt', { encoding: binaryEncoding }, function (error, stdout, stderr) {

  if (error) {
    console.log(iconv.decode('error: ' + error, encoding));
    return;
  }
  console.log(iconv.decode('stdout: ' + stdout, encoding));
  console.log(iconv.decode('stderr: ' + stderr, encoding));
});