'use strict'

import path from 'path'
import { fileURLToPath } from 'url'
import Koa from 'koa'
import { koaBody } from 'koa-body'
import send from 'koa-send'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = new Koa()

app
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

export default app

if (process.argv[1] && process.argv[1].endsWith('index.js') && import.meta.url.startsWith('file:')) {
  const port = process.env.PORT || 18888
  app.listen(port)
  console.info(`Open http://localhost:${port}/`)
}
