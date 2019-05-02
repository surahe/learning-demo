/**
 * 时间戳实现
 */
function throttle1(func, wait) {
  var previous = 0

  return function () {
    var now = +new Date()
    var args = arguments
    var context = this
    if (now - previous > wait) {
      func.apply(context, args)
      previous = now
    }
  }
}

/**
 * 定时器实现
 */
function throttle2(func, wait) {
  var timeout

  return function () {
    var context = this
    var args = arguments

    if (!timeout) {
      timeout = setTimeout(function () {
        timeout = null
        func.apply(context, args)
      }, wait)
    }
  }
}

/**
 * 优化，添加取消
 * 
 * option:{leading：false} 表示禁用第一次执行
 * option:{trailing: false} 表示禁用停止触发的回调
 */
function throttle(func, wait, options) {
  var timeout, context, args
  var previous = 0
  if (!options) options = {}

  var later = function () {
    previous = options.leading === false ? 0 : new Date().getTime()
    timeout = null
    func.apply(context, args)
    if (!timeout) context = args = null
  }

  var throttled = function () {
    var now = new Date().getTime()
    if (!previous && options.leading === false) previous = now
    //下次触发 func 剩余的时间
    var remaining = wait - (now - previous)
    context = this
    args = arguments
    // 如果没有剩余的时间了或者你改了系统时间
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout)
        timeout = null
      }
      previous = now
      func.apply(context, args)
      if (!timeout) context = args = null
    // 定时器已清除且 traiing 不为 false
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining)
    }
  }

  throttled.cancel = function () {
    clearTimeout(timeout)
    previous = 0
    timeout = null
  }
  return throttled
}