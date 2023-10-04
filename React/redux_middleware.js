function applyMiddleware(...middlewares) {
  // applyMiddleware返回另一个函数，也就是`enhancer`。
  // `enhancer`接受原来的createStore函数为参数.
  return function enhancer(createStore) {
    // enhancer的返回值是另一个函数，其实就是`新的createStore`
    return function enhancedCreateStore(...args) {
      // 调用老的createStore，来获得store。
      const store = createStore(...args)
      // 定义新的dispatch函数，后边会被修改
      let dispatch = () => {
        thrownewError('Dispatching while constructing your middleware is not allowed.Other middleware would not be applied to this dispatch.')
      }
      // 暴露个每个middleware的API。
      const middlewareAPI = {
        getState: store.getState,
        dispatch: (...args) => dispatch(...args)
      }
      // 把所有传入的middlewares转为一个数组。
      const chain = middlewares.map(function (middleware) {
        return middleware(middlewareAPI)
      })
      // 新的dispatch函数，其实就是把所有middleware的调用链加入dispatch的执行过程中。
      dispatch = compose(...chain)(store.dispatch)
      // 新的createStore的返回值，其实唯一变化的就是dispatch字段。
      return {
        ...store,
        dispatch,
      }
    }
  }
}

function compose(...funcs) {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce(function reducer(a, b) {
    return function (...args) {
      return a(b(...args))
    }
  })
}

function createStore(reducer, enhancer) {
  if (enhancer) {
    return enhancer(createStore)(reducer);
  }
  return {
    // return created store
  }
}

// 假如我们要注册两个middleware: middleware1和middleware2
const enhancer = applyMiddleware(middleware1, middleware2);
const store = createStore(reducers, enhancer);