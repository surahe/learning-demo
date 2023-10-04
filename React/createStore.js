
// 整个文件只导出一个函数，就是createStore函数。参数如下：
// * reducer - 我们传入的reducer纯函数，用来定义我们的state可以做的操作，如果不懂它的概念可以参考上一篇文章
// * preloadedState - state的初始化值
// * enhancer - 当我们需要使用middleware的时候，会用到。
export default function createStore(reducer, preloadedState, enhancer) {
  // 当前的reducer。Redux支持我们替换当前的reducer为另一个函数
  let currentReducer = reducer
  // 用来存储我们整个程序的状态
  let currentState = preloadedState
  // 状态监听函数，当状态发生改变的时候会被调用。可以注册多个监听函数。
  let currentListeners = []
  // 这个是为了处理一些异常情况而保存一份currentListeners的shallow copy副本，不影响核心逻辑的理解，可以暂时忽略
  let nextListeners = currentListeners
  
  // 提供给外部调用，用来获取当前state。由于state是Redux的内部变量，外部只能通过API函数来获取状态。
  function getState() {
    return currentState
  }
  
  // 注册监听器，listener是回调函数，当状态被修改的时候调用
  function subscribe(listener) {
    nextListeners.push(listener)
    return function unsubscribe() {
      const index = nextListeners.indexOf(listener)
      nextlisteners.splice(index, 1)
    }
  }
  
  // dispatch用来修改一个状态
  function dispatch(action) {
    try {
      isDispatching = true
      // 调用当前的reducer，传入当前状态和action，然后将返回值更新为新状态
      currentState = currentReducer(currentState, action)
    } finally {
      isDispatching = false
    }
    // 依次调用监听器函数
    const listeners = (currentListeners = nextListeners)
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i]
      listener()
    }
    return action
  }
  
  // 更换reducer函数
  function replaceReducer(nextReducer) {
    currentReducer = nextReducer
    dispatch({ type: ActionTypes.REPLACE })
  }
  
  // dispatch一个INIT事件，外部可以监听这个事件，用于一些初始化的工作
  dispatch({ type: ActionTypes.INIT })
  
  // 返回值是一个对象，包含了用于获取和操作状态的函数
  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
  }
}