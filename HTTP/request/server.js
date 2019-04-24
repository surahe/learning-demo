const http = require('http')
const data = {
  a:1
}

http.createServer(function (req, res) {
  console.log(`requeset come ${req.url}`)
  res.writeHead(200, {"Content-Type": "text/json"});
  res.end(JSON.stringify(data))
}).listen(8887)

console.log('server listen on 8887')