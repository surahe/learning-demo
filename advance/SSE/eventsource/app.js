var express = require('express')
var app = express()
var path = require('path')
var ejs = require('ejs');
const SseStream = require('ssestream')

let sendCount = 1

// 视图的根目录
app.engine('html', ejs.__express);
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'html')

app.use(express.static(__dirname + '/static'))

// index page
app.get('/', function (req, res) {
  res.render('index')
})

app.get('/api', function (req, res) {
  // res.setHeader('Content-Type', 'text/event-stream')
  // res.setHeader('charset', 'utf-8')

  // res.write({
  //   id: sendCount,
  //   event: 'server-time',
  //   retry: 20000, // 告诉客户端,如果断开连接后,20秒后再重试连接
  //   data: {ts: new Date().toTimeString(), count: sendCount++}
  // });
  const sseStream = new SseStream(req)
  sseStream.pipe(res)
  const pusher = setInterval(() => {
    sseStream.write({
      id: sendCount,
      event: 'server-time',
      retry: 20000, // 告诉客户端,如果断开连接后,20秒后再重试连接
      data: { ts: new Date().toTimeString(), count: sendCount++ }
    })
  }, 5000)

  res.on('close', () => {
    clearInterval(pusher)
    sseStream.unpipe(res)
  })
})

app.listen(3000)