const fs = require('fs')
const path = require('path')
const KOA = require('koa')
const Router = require('koa-router')

const app = new KOA()
const router = new Router()

const task1 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(`<script>addHtml('part1', '第一次传输 <br>')</script>`)
    }, 2000)
  })
}

const task2 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(`<script>addHtml('part2', '第二次传输 <br>')</script>`)
    }, 1000)
  })
}

router.get('/', async (ctx, next) => {
  const filename = path.resolve(__dirname, './index3.html')
  const stream = fs.createReadStream(filename)

  ctx.status = 200
  ctx.type = 'html'

  stream.on('data', (chunk) => {
    ctx.res.write(chunk)
  })

  await Promise.all([
    task1().then(r => {
      ctx.res.write(r)
    }),
    task2().then(r => {
      ctx.res.write(r)
    })
  ])
    .then(() => {
      ctx.res.write('</body></html>')
      ctx.res.end()
    })
})

app.use(router.routes())
  .use(router.allowedMethods())

app.listen(8085)
