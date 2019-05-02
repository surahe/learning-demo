'use strict'

/**
 * 无法再意外创建全局变量
 */
mistypedVaraible = 17;
// Uncaught ReferenceError: mistypedVaraible is not defined


/**
 * 会使引起静默失败
 */

// 给不可写的全局变量赋值
var NaN = 1  // TypeError: Cannot assign to read only property 'NaN' of object '#<Window>'

// 给不可写属性赋值
var obj1 = {};
Object.defineProperty(obj1, "x", { value: 42, writable: false });
obj1.x = 9;  // TypeError: Cannot assign to read only property 'x' of object '#<Object>'

// 给只读属性赋值
var obj2 = { get x() { return 17; } };
obj2.x = 5;  // TypeError: Cannot set property x of #<Object> which has only a getter

// 给不可扩展对象的新属性赋值
var fixed = {};
Object.preventExtensions(fixed);
fixed.newProp = "ohai";  // TypeError: Cannot add property newProp, object is not extensible

/**
 * 删除不可删除的属性
 */
delete Object.prototype // TypeError: Cannot delete property 'prototype' of function Object() { [native code] }

/**
 * 函数的参数名唯一
 */
function sum(a, a, c){ // SyntaxError: Duplicate parameter name not allowed in this context
  "use strict";
  return a + a + c;
}

/**
 * 禁止八进制数字语法
 */
var sum = 015 + 197 + 142; //  SyntaxError: Octal literals are not allowed in strict mode.

/**
 * 禁止设置基本类型的属性
 */
false.true = "";  // TypeError: Cannot create property 'true' on boolean 'false'
(14).sailing = "home"; // TypeError: Cannot create property 'sailing' on number '14'
"with".you = "far away"; // TypeError: Cannot create property 'you' on string 'with'

/**
 * 禁止使用with
 */
var x = 17;
with (obj) // SyntaxError: Strict mode code may not include a with statement
{
  // 如果没有开启严格模式，with中的这个x会指向with上面的那个x，还是obj.x？
  // 如果不运行代码，我们无法知道，因此，这种代码让引擎无法进行优化，速度也就会变慢。
  x;
}

/**
 * eval 不再为上层范围引入新变量
 */
var x = 17;
var evalX = eval("'use strict'; var x = 42; x");
console.assert(x === 17);
console.assert(evalX === 42);


/**
  * 禁止删除声明变量
  */
var x;
delete x; // SyntaxError: Delete of an unqualified identifier in strict mode

/**
 * 名称 eval 和 arguments 不能通过程序语法被绑定(be bound)或赋值
 * 以下都会报错
 */
eval = 17;
arguments++;
++eval;
var obj = { set p(arguments) { } };
var eval;
try { } catch (arguments) { }
function x(eval) { }
function arguments() { }
var y = function eval() { };
var f = new Function("arguments", "'use strict'; return 17;");


/**
 * 参数的值不会随 arguments 对象的值的改变而变化
 */
function f(a){
  "use strict";
  a = 42;
  return [a, arguments[0]];
}
f(17); // [42, 17]


function f1(a){
  a = 42;
  return [a, arguments[0]];
}
f1(17); // [42, 42]

/**
 * 不再支持 arguments.callee
 */
var f2 = function() { return arguments.callee; };
f2(); // 抛出类型错误

/**
 * 通过this传递给一个函数的值不会被强制转换为一个对象
 */
function fun() { return this; }
fun() === undefined // true
fun.call(2) === 2 // true
fun.apply(null) === null // true
fun.call(undefined) === undefined // true
fun.bind(true)() === true // true

/**
 * 不能通过广泛实现的ECMAScript扩展“游走于”JavaScript的栈中
 */
function restricted()
{
  "use strict";
  restricted.caller;    // 抛出类型错误
  restricted.arguments; // 抛出类型错误
}
function privilegedInvoker()
{
  return restricted();
}
privilegedInvoker();

/**
 * 禁止了不在脚本或者函数层面上的函数声明（chrome未实现）
 */
if (true){
  function f() { } // !!! 语法错误
  f();
}

for (var i = 0; i < 5; i++){
  function f2() { } // !!! 语法错误
  f2();
}

function baz() { // 合法
  function eit() { } // 同样合法
}