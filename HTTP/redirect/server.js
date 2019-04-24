const http = require('http')

http.createServer(function (req, res) {
  console.log(`requeset come ${req.url}`)
  // 临时跳转
  if (req.url === '/') {
    res.writeHead(302, {
      'location': '/new2'
    })
    res.end()
  } 
  if (req.url === '/new2') {
    res.writeHead(200, {
      'Content-type': 'text/html'
    })
    res.end('<div>content</div>')
  } 
}).listen(8888)

console.log('server listen on 8888')