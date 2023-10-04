// 整个文件导出一个函数
// 参数reducers是一个Object，比如一个todo app可能包含users和todos两部分数据，那么它的格式如下：
// {
//    users: function userReducer(){},
//    todos: function todoReducer(){}, 
// }
export default function combineReducers(reducers) {
  // 获得reducerKeys，方便下面遍历reducers使用
  const reducerKeys = Object.keys(reducers)
  // finalReducers和reducers差不多，主要为了保证每个value都是一个function
  const finalReducers = {}
  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i]
    if (typeof reducers[key] === 'function') {
      finalReducers[key] = reducers[key]
    }
  }

  // 同样取得keys是为了方便遍历object
  const finalReducerKeys = Object.keys(finalReducers)
  // combineReducers的返回值，是一个函数(是个reducer，合并后的整体的reducer)。
  return function combination(state = {}, action) {
    // 状态是否发生了改变
    let hasChanged = false
    // 新的总体的状态
    const nextState = {}
    // 遍历所有reducers
    for (let i = 0; i < finalReducerKeys.length; i++) {
      // key，相当于每个reducer的名字
      const key = finalReducerKeys[i]
      // 当前正在遍历的reducer函数
      const reducer = finalReducers[key]
      // 当前reducer的老的state
      const previousStateForKey = state[key]
      // 当前reducer新的状态
      const nextStateForKey = reducer(previousStateForKey, action)
      // 将新的子状态放到整体状态的一个字段中，字段名就是reducer的名字
      nextState[key] = nextStateForKey
      // 判断状态是否发生改变。注意，这里判断是直接判断对象的引用，而不会深入判断对象内的字段。
      // 这也是为什么reducer中必须返回一个新的对象而不是修改老的对象
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey
    }
    // 返回值，如发生改变返回新的状态，否则返回老状态。
    return hasChanged ? nextState : state
  }
}