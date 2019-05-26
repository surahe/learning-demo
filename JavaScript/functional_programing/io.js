var fs = require('fs');
var path = require('path')
var _ = require('lodash');
var compose = _.flowRight;

//基础函子
class Functor {
  constructor(val) {
    this.val = val;
  }
}

//Monad 函子
class Monad extends Functor {
  join() {
    return this.val;
  }
  flatMap(f) {
    //1.f 接受一个函数返回的IO函子
    //2.this.val 等于上一步的脏操作
    //3.this.map(f) compose(f, this.val) 函数组合 需要手动执行
    //4.返回这个组合函数并执行 注意先后的顺序
    return this.map(f).join();
  }
}

//IO函子用来包裹📦脏操作
class IO extends Monad {
  //val是最初的脏操作
  static of(val) {
    return new IO(val);
  }
  map(f) {
    return IO.of(compose(f, this.val))
  }
}


var readFile = function (filename) {
  return IO.of(function () {
    return fs.readFileSync(filename, 'utf-8');
  });
};

var print = function (x) {
  console.log('外层');
  return IO.of(function () {
    console.log("内层")
    return x + "函数式";
  });
}

var tail = function (x) {
  console.log(x);
  return IO.of(function () {
    return x + "内层";
  });
}

const result = readFile(path.resolve(__dirname, './user.txt'))
  //flatMap 继续脏操作的链式调用
  // .flatMap(print);
  .flatMap(print)()
  .flatMap(tail)();
console.log(result.val());