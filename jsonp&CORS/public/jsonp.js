function jsonp({ url, params, callback }) {
  return new Promise((resolve, reject) => {
    // 创建 script标签
    let script = document.createElement('script')

    // 声明一个回调函数，其函数名(如show)当做参数值，要传递给跨域请求数据的服务器
    // 函数形参 data 为要获取目标数据(接口返回的数据)
    window[callback] = function(data) {
      // 执行jsonp返回的函数
      resolve(data)
      // 移除添加的script
      document.body.removeChild(script)
    }

    // params 和 callback 参数转换成 ?wd=Iloveyou&callback=show 形式
    params = { ...params, callback }
    let arrs = []
    for (let key in params) {
      arrs.push(`${key}=${params[key]}`)
    }
    script.src = `${url}?${arrs.join('&')}`
  
    // 添加scirpt标签
    document.body.appendChild(script)
  })
}