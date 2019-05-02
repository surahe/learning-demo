// server.js

let express = require('express')
let app = express()

// CORS处理复杂请求
// 如果用 app.get() 会无法处理 OPTIONS 请求
app.use('/say', function(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-Custom-Header')
  res.json({user:'我不爱你'})
})

// jsonp
app.get('/json', function(req, res) {
  let { wd, callback } = req.query
  let data = {
    user: 'sura',
    name: '哈哈'
  }

  // 处理参数
  jsonpData = JSON.stringify(data)

  console.log(wd) // Iloveyou
  console.log(callback) // show

  setTimeout(() => {
    res.setHeader('Content-Type', 'text/html;charset=UTF-8')
    // 将返回内容设置为格式如：show({a: 1, b: 2})
    res.end(`${callback}(${jsonpData})`)
  }, 1000)
})


app.listen(3000)