const util = require('util');
const puppeteer = require('puppeteer')

const app = require('./server')
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

module.exports = {
  sleep: util.promisify(setTimeout),
  assert: require('chai').assert
}
