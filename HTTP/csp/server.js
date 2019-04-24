const http = require('http')
const fs = require('fs')

http.createServer(function (req, res) {
  console.log(`requeset come ${req.headers.host}`)
  const html = fs.readFileSync('index.html', 'utf8')
  if(req.url === '/') {
    res.writeHead(200, {
      'Content-Type': 'text/html',
      // 'Content-Security-Policy': 'default-src http: https:'
       // default-src \'self\'只能加载本域名，inline也不能执行
      'Content-Security-Policy': 'default-src \'self\'; form-action \'self\'; report-uri /report',
      // 只报告不限制
      // 'Content-Security-Policy-report-only': 'default-src \'self\'; report-uri /report'
    })
    res.end(html)
  } else {
    res.writeHead(200, {
      'Content-Type': 'text/javascript'
    })
    res.end('console.log("load script")')
  }
}).listen(8888)

console.log('server listen on 8888')