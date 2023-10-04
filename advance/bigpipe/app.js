/**
 * 只能往body里追加
 */

const KOA = require('koa')
const Router = require('koa-router')

const app = new KOA()
const router = new Router()

const task1 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('第一次传输 <br>')
    }, 3000)
  })
}

const task2 = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('第二次传输 <br>')
    }, 3000)
  })
}

router.get('/', async (ctx, next) => {
  ctx.status = 200
  ctx.type = 'html'
  ctx.res.write('loading...<br>')
  ctx.res.write(await task1())
  ctx.res.write(await task2())
  ctx.res.write('456')
  ctx.res.end()
})

app.use(router.routes())
  .use(router.allowedMethods())

app.listen(8085)
