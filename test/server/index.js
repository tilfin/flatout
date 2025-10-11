'use strict'

import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs/promises'
import Fastify from 'fastify'
import multipart from '@fastify/multipart'
import formbody from '@fastify/formbody'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = Fastify({ logger: false })

// Treat empty application/json bodies as an empty object to avoid
// Fastify's FST_ERR_CTP_EMPTY_JSON_BODY when client sets
// Content-Type: application/json but sends an empty payload.
app.addContentTypeParser('application/json', { parseAs: 'string' }, function (req, body, done) {
  if (body === '' || body === undefined || body === null) {
    // return an empty object instead of throwing
    done(null, {})
    return
  }
  try {
    done(null, JSON.parse(body))
  } catch (err) {
    err.statusCode = 400
    done(err)
  }
})

// parse urlencoded bodies
app.register(formbody)
// parse multipart and attach fields to body
app.register(multipart, { attachFieldsToBody: 'keyValues' })

const SRC_ROOT = path.resolve(__dirname, '../../src')
const MODULES_ROOT = path.resolve(__dirname, '../../node_modules')

const sendStaticFile = async (root, relPath, reply) => {
  const rel = relPath.replace(/^\//, '')
  const candidates = []

  if (rel === '' || rel === '/') {
    candidates.push('index.html')
  }

  if (relPath.endsWith('/')) {
    candidates.push(path.join(rel, 'index.html'))
  } else if (path.extname(rel) === '') {
    // try directory index first, then .js, then bare name
    candidates.push(path.join(rel, 'index.html'))
    candidates.push(rel + '.js')
    candidates.push(rel)
  } else {
    candidates.push(rel)
  }

  for (const candidate of candidates) {
    const filePath = path.join(root, candidate)
    try {
      const st = await fs.stat(filePath)
      if (!st.isFile()) continue
      const data = await fs.readFile(filePath)
      const ext = path.extname(filePath).toLowerCase()
      const type = ext === '.js' ? 'application/javascript'
        : ext === '.html' ? 'text/html'
        : ext === '.css' ? 'text/css'
        : ext === '.json' ? 'application/json'
        : ext === '.png' ? 'image/png'
        : ext === '.svg' ? 'image/svg+xml'
        : 'application/octet-stream'
      reply.type(type).send(data)
      return
    } catch (err) {
      // not found, try next candidate
      // only log verbose on unexpected errors
      if (err.code && err.code !== 'ENOENT') console.error(err)
    }
  }

  // nothing matched
  reply.code(404).send('Not Found')
}

// catch-all route to mirror previous Koa behavior
app.route({
  method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  url: '/*',
  handler: async (request, reply) => {
    const { method, query, headers } = request
    const body = request.body || null
    const rawUrl = request.url || ''
    const pt = rawUrl.split('?')[0]

    const testPathPrefix = '/httptest'
    if (pt.startsWith(testPathPrefix)) {
      const statusPart = pt.substring(testPathPrefix.length + 1)
      const status = Number(statusPart) || 200
      reply.code(status).send({ method, path: pt, query, body, contentType: headers['content-type'] || null, headers })
      return
    }

    if (pt.startsWith('/lib/')) {
      const rel = pt.replace(/^\/lib/, '')
      await sendStaticFile(SRC_ROOT, rel, reply)
      return
    }

    if (pt.startsWith('/modules/')) {
      const rel = pt.replace(/^\/modules/, '')
      await sendStaticFile(MODULES_ROOT, rel, reply)
      return
    }

    // default: serve files from this directory, with index.html fallback
    let rel = pt
    if (rel === '/' || rel === '') rel = '/index.html'
    await sendStaticFile(__dirname, rel, reply)
  }
})

export default app

if (process.argv[1] && process.argv[1].endsWith('index.js') && import.meta.url.startsWith('file:')) {
  const port = process.env.PORT || 18888
  app.listen(port)
  console.info(`Open http://localhost:${port}/`)
}
