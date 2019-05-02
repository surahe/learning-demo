const fs = require('fs')
const now = Date.now();
let flag = true

setTimeout(() => console.log('setTimeout'), 10);

fs.readFile(__filename, () => {
  console.log('readfile')
});

setImmediate(() => console.log('setImmediate'));

while (Date.now() - now < 1000) {
  if (flag) {
    flag = false
    console.log('延迟1秒...')
  }
}