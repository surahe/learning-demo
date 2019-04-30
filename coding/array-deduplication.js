var array = [1, 1, '1', '1', null, null, undefined, undefined, new String('1'), new String('1'), /a/, /a/, NaN, NaN]

/**
 * 双层循环
 * 复杂度 O(n^2) 
 */

function doubleCirculation (arr) {
  var res = []
  for (var i = 0; i< arr.length; i++) {
    for(var j = 0; j < res.length; j++) {
      if (arr[i] === res[j]) {
        break
      }
    }
    // 如果array[i]是唯一的，那么执行完循环，j等于resLen
    if (j === res.length) {
      res.push(arr[i])
    }
  }
  return res
}

// 使用indexOf优化
function doubleCirculation2 (arr) {
  var res = []
  for (var i = 0; i< arr.length; i++) {
    var cur = arr[i]
    if (res.indexOf(cur) === -1) {
      res.push(cur)
    }
  }
  return res
}

// 使用indexOf和filter优化
// 利用indexOf返回第一个符合条件元素的下标
function doubleCirculation3 (arr) {
  var res = arr.filter((item, index, array) => {
    return array.indexOf(item) === index
  })
  return res
}




/**
 * 排序后去重
 */
function beforeSort (arr) {
  var res = []
  var sortedArray = arr.concat().sort() // concat用来复制出来一份原有的数组
  var lastItem
  for (var i = 0; i < sortedArray.length; i++) {
    // 如果是第一个元素或者相邻的元素不相同
    if (!i || sortedArray[i] !== lastItem) {
      res.push(sortedArray[i])
    }
    lastItem = sortedArray[i]
  }
  return res
}

// 使用 filter 优化
function beforeSort2 (arr) {
  return arr.concat().sort().filter(function (item, index, array) {
    return !index || item !== array[index - 1]
  })
}



/**
 * 
 * @param {Array} arr        待排序数组
 * @param {Boolean} isSorted 数组是否已排序
 */
function unique (arr, isSorted) {
  var res = []
  var seen = []

  for (var i = 0; i < arr.length; i++) {
    if (isSorted) {
      if (!i || seen === arr[i]) {
        res.push(arr[i])
      }
      seen = arr[i]
    } else if (res.indexOf(arr[i]) === -1) {
      res.push(arr[i])
    }
  }
  return res
}


/**
 * 
 * @param {Array} array 表示要去重的数组，必填
 * @param {Boolean} isSorted 表示函数传入的数组是否已排过序，如果为 true，将会采用更快的方法进行去重
 * @param {Function} iteratee 传入一个函数，可以对每个元素进行重新的计算，然后根据处理的结果进行去重
 */
function unique2(array, isSorted, iteratee) {
  var res = []
  var seen = []

  for (var i = 0, len = array.length; i < len; i++) {
      var value = array[i]
      var computed = iteratee ? iteratee(value, i, array) : value
      if (isSorted) {
          if (!i || seen !== computed) {
              res.push(value)
          }
          seen = computed
      }
      else if (iteratee) {
          if (seen.indexOf(computed) === -1) {
              seen.push(computed)
              res.push(value)
          }
      }
      else if (res.indexOf(value) === -1) {
          res.push(value)
      }        
  }
  return res
}
unique(array, false, function(item){
  return typeof item == 'string' ? item.toLowerCase() : item
})

// Object 键值对
function unique3(array) {
  var obj = {};
  return array.filter(function(item, index, array){
      console.log(typeof item + JSON.stringify(item))
      return obj.hasOwnProperty(typeof item + JSON.stringify(item)) ? false : (obj[typeof item + JSON.stringify(item)] = true)
  })
}


/**
 * Set 和 Map
 */
function uniqueSet(array) {
  return [...new Set(array)]
}
function uniqueMap (arr) {
  const seen = new Map()
  return arr.filter((a) => !seen.has(a) && seen.set(a, 1))
}