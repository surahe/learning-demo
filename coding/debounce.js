function debounce1(func, wait) {
  var timmer
  return function () {
    clearTimeout(timmer)
    timmer = setTimeout(func, wait)
  }
}

/**
 * 修复 debounce1 中 func 中的 this 会指向 window
 */
function debounce2(func, wait) {
  var timmer

  return function () {
    var that = this // 获取this

    clearTimeout(timmer)
    timmer = setTimeout(function () {
      func.apply(that) //修复 this
    }, wait)
  }
}

/**
 * 修复 event 对象指向问题
 */

function debounce3(func, wait) {
  var timmer

  return function () {
    var that = this
    var args = arguments

    clearTimeout(timmer)
    timmer = setTimeout(function () {
      func.apply(that, args)
    }, wait)
  }
}

/**
 * 立刻执行函数，然后等到停止触发 n 秒后，才可以重新触发执行
 */

function debounce4(func, wait, immediate) {

  var timeout

  return function () {
    var context = this
    var args = arguments

    if (timeout) clearTimeout(timeout)
    if (immediate) {
      // 如果已经执行过，不再执行
      var callNow = !timeout
      timeout = setTimeout(function () {
        timeout = null
      }, wait)
      if (callNow) func.apply(context, args)
    }

    else {
      timeout = setTimeout(function () {
        func.apply(context, args)
      }, wait)
    }
  }
}


/**
 * 返回 func 的返回值
 */
function debounce5(func, wait, immediate) {

  var timeout, result

  return function () {
    var context = this
    var args = arguments

    if (timeout) clearTimeout(timeout);
    if (immediate) {
      var callNow = !timeout
      timeout = setTimeout(function () {
        timeout = null
      }, wait)
      // 在 immediate 为 true 的时候返回函数的执行结果
      if (callNow) result = func.apply(context, args) 
    }
    else {
      timeout = setTimeout(function () {
        func.apply(context, args)
      }, wait)
    }
    return result
  }
}

/**
 * 取消功能
 */

function debounce(func, wait, immediate) {

  var timeout, result

  var debounced = function () {
    var context = this
    var args = arguments

    if (timeout) clearTimeout(timeout)
    if (immediate) {
      var callNow = !timeout
      timeout = setTimeout(function () {
        timeout = null
      }, wait)
      if (callNow) result = func.apply(context, args)
    }
    else {
      timeout = setTimeout(function () {
        func.apply(context, args)
      }, wait)
    }
    return result
  }

  // 取消
  debounced.cancel = function () {
    clearTimeout(timeout)
    timeout = null
  }

  return debounced
}