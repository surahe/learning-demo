// 接收多个函数作为参数，从右到左，一个函数的输入为另一个函数的输出。
const compose = function (f, g) {
  return function (x) {
    return f(g(x));
  };
}

var first = arr => arr[0];
var reverse = arr => arr.reverse();
var last = compose(first, reverse);
console.log(last([1,2,3,4,5])) // 5
