try {
  try {
      throw new Error('can not find it1');
  } finally {
      throw new Error('can not find it2');
  }
} catch (err) {
  // 捕获到了 finally 抛出的异常
  console.log(err.message);
}

/**
 * finally 中的 return 会覆盖try 和 catch 的异常
 */
function test() {
  try {
      throw new Error('can not find it1');
      return 1;
  } catch (err) {
      throw new Error('can not find it2');
      return 2;
  } finally {
      return 3;
  }
}

console.log(test()); // 3

/**
 * 不能捕获异步错误
 */
try {
  setTimeout(() => {
      throw new Error("some message");
  }, 0);
} catch (err) {
  console.log(err);
}
// Uncaught Error: some message