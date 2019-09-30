'use strict'

const path = require('path')
const Koa = require('koa')
const koaBody = require('koa-body')
const send = require('koa-send')

const app = new Koa()

app
  //.use(require('koa-pino-logger')())
  .use(koaBody({ multipart: true }))
  .use(async (ctx) => {
    const { method, query, body } = ctx
    let pt = ctx.path

    const testPathPrefix = '/httptest'
    if (pt.startsWith(testPathPrefix)) {
      ctx.status = Number(pt.substr(testPathPrefix.length + 1)) || 200
      ctx.body = {
        method, path: pt, query,
        body: ctx.request.body || null,
        contentType: ctx.headers['content-type'] || null,
        headers: ctx.headers
      }
      return
    }

    if (pt.startsWith('/lib/')) {
      pt = pt.replace(/^\/lib/, '')
      if (pt.lastIndexOf('.') === -1) pt += '.js'
      await send(ctx, pt, { root: path.resolve(__dirname, '../../src') })
    } else if (pt.startsWith('/modules/')) {
      pt = pt.replace(/^\/modules/, '')
      if (pt.lastIndexOf('.') === -1) pt += '.js'
      await send(ctx, pt, { root: path.resolve(__dirname, '../../node_modules') })
    } else {
      await send(ctx, pt, { root: __dirname, index: 'index.html' })
    }
  })

module.exports = app

if (!module.parent) {
  const port = process.env.PORT || 18888
  app.listen(port)
  console.info(`Open http://localhost:${port}/`)
}
