const http = require('http')
const fs = require('fs')

http.createServer(function (req, res) {
  console.log(`requeset come ${req.url}`)

  const html = fs.readFileSync('index.html', 'utf8')
  const img = fs.readFileSync('test.jpg')
  if (req.url === '/') {
    res.writeHead(200, {
      'Content-type': 'text/html',
      // 'connection': 'close'  // 非持久连接
    })
    res.end(html)
  } else {
    res.writeHead(200, {
      'Content-type': 'image/jpg',
      // 'connection': 'close'  // 非持久连接
    })
    res.end(img)
  }
}).listen(8888)

console.log('server listen on 8888')