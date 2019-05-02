var array = [1, [2, [3, 4]]]

function flatten1(arr) {
  var result = []
  for (var i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      result.push.apply(result, flatten1(arr[i]))
      // 也可以使用 concat，但会产生新数组
      // result = result.concat(flatten1(arr[i]))
    } else {
      result.push(arr[i])
    }
  }
  return result
}

// 处理字符串的item会出错
function flatten2(arr) {
  return arr.toString().split(',').map(function (item) {
    return +item
  })
}

// reduce
function flatten3(arr) {
  return arr.reduce(function (prev, next) {
    // 可以简写成
    // return prev.concat(Array.isArray(next) ? flatten3(next) : next)
    if (Array.isArray(next)) {
      return prev.concat(flatten3(next))
    } else {
      return prev.concat(next)
    }
  }, [])
}

// [].concat(... [1, [2, [3, 4]]])
// 实际上是
// [].concat(1, [2, [3, 4]])
function flatten4 (arr) {
  while(arr.some((item) => Array.isArray(item))) {
    arr = [].concat(...arr)
  }
  return arr
}

console.log(flatten4(array))