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
    }, 3000)
  })
}

const task2 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(`<script>addHtml('part2', '第二次传输 <br>')</script>`)
    }, 3000)
  })
}

router.get('/', async (ctx, next) => {
  const file = fs.readFileSync(path.resolve(__dirname, './index3.html'), 'utf-8')
  ctx.status = 200
  ctx.type = 'html'
  ctx.res.write(file)
  ctx.res.write(await task1())
  ctx.res.write(await task2())
  ctx.res.write('</body></html>')
  ctx.res.end()
})

app.use(router.routes())
  .use(router.allowedMethods())

app.listen(8085)
