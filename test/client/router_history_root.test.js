const { assert, sleep } = require('../helper')

describe('Router works history mode with rootPath', () => {
  let page

  beforeEach(async () => {
    page = await __BROWSER__.newPage();
  })

  afterEach(async () => {
    await page.close()
  })

  it("tour each page", async () => {
    let title;

    await page.goto(`${__ENDPOINT__}/app/history-root/`, { waitUntil: 'networkidle2' })
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'Home | Example App')

    await page.click('a.about')
    await sleep(5)
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'About | Example App')

    await page.click('a.books')
    await sleep(5)
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'BookList | Example App')

    await page.click('a.book')
    await sleep(5)
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'Book5 | Example App')

    await page.click('a.readers')
    await sleep(10) // wait redirect
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'Book3 | Example App') // books/3

    await page.click('a.reader')
    await sleep(5)
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'BookReader id:3 reader:tom | Example App')
  })
})
