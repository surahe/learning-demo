const express = require('express')
const app = express()

app.use(express.static(__dirname + '/public'))

app.get('/', (req, res) => {
  res.sendFile('index.html')
})

app.listen(8888)

// 不用框架
// const fs = require('fs')
// const http = require('http')

// const html = fs.readFileSync('index.html', 'utf8')

// http.createServer(function (req, res) {
//   if (req.url === '/') {
//     res.writeHead('200', {
//       'Content-Type': 'text/html'
//     })
//     res.end(html)
//   }
// }).listen(8888)