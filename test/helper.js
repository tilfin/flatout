import util from 'util'
import puppeteer from 'puppeteer'
import app from './server/index.js'
import * as chai from 'chai'

let server, browser;

before(async () => {
  const port = process.env.PORT || 18888;
  server = app.listen(port)
  global.__ENDPOINT__ = `http://localhost:${port}`;

  browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  global.__BROWSER__ = browser;
})

after(async () => {
  await browser.close()
  server.close()
})

export const sleep = util.promisify(setTimeout)
export const assert = chai.assert
