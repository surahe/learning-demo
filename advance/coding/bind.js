Function.prototype.bind = function (oThis) {
  if (typeof this !== 'function') {
    // closest thing possible to the ECMAScript 5
    // internal IsCallable function
    throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
  }

  var aArgs = Array.prototype.slice.call(arguments, 1) // 函数调用的参数
  var fToBind = this  // 要调用的函数
  var fNOP = function () { }  // 空函数
  var fBound = function () {
    // 直接调用func，this指向window
    // 使用new调用，this指向bind调用后的返回值，即fBound，其原型是foo
    return fToBind.apply(this instanceof fBound
      ? this
      : oThis,
      // 将bind调用时的参数与返回的函数func实际调用时的参数拼接
      aArgs.concat(Array.prototype.slice.call(arguments)));
  };

  // 维护原型关系
  // 实现继承，相当于 fBound.prototype = Object.create(this.Prototype)
  if (this.prototype) {
    // Function.prototype没有prototype属性
    fNOP.prototype = this.prototype;
  }
  // 下行的代码使fBound.prototype是fNOP的实例,因此
  // 返回的fBound若作为new的构造函数,new生成的新对象作为this传入fBound,新对象的__proto__就是fNOP的实例
  fBound.prototype = new fNOP();

  return fBound;
};


function foo(name) {
  this.name = name;
}

var obj = {a:1}

//上下文 功能  done
var bar = foo.bind(obj, 'suwa')
bar('jack')
console.log(obj.name) //'jack