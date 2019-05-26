// 创建偏函数，固定一些参数
const partical = (f, ...args) =>
  // 返回一个带有剩余参数的函数
  (...moreArgs) =>
    // 调用原始函数
    f(...args, ...moreArgs)

const add3 = (a, b, c) => a + b + c

// (...args) => add3(2, 3, ...args)
// (c) => 2 + 3 + c
const fivePlus = partical(add3, 2, 3)

fivePlus(4)  // 9