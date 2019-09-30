const { assert, sleep } = require('../helper')

describe('Router works hash mode', () => {
  let page

  beforeEach(async () => {
    page = await __BROWSER__.newPage();
  })

  afterEach(async () => {
    await page.close()
  })

  it("tour each page", async () => {
    let title;

    await page.goto(`${__ENDPOINT__}/app/hash.html`, { waitUntil: 'networkidle2' })
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'Home | Example App')

    await page.evaluate(() => { window.location.hash ='#!/about' })
    await sleep(15)
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'About | Example App')

    await page.evaluate(() => { window.location.hash ='#!/books' })
    await sleep(15)
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'BookList | Example App')

    await page.evaluate(() => { window.location.hash ='#!/docs/api' })
    await sleep(15)
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'API Documents | Example App')

    await page.evaluate(() => { window.location.hash ='#!/someone' })
    await sleep(15)
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'User/someone | Example App')

    await page.evaluate(() => { window.location.hash ='#!/books/5' })
    await sleep(15)
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'Book5 | Example App')

    await page.evaluate(() => { window.location.hash ='#!/someone/timeline' })
    await sleep(15)
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'UserTimeline/someone | Example App')

    await page.evaluate(() => { window.location.hash ='#!/books/3/readers' })
    await sleep(15) // wait redirect
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'Book3 | Example App') // books/3

    await page.evaluate(() => { window.location.hash ='#!/books/3/readers/tom' })
    await sleep(15)
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'BookReader id:3 reader:tom | Example App')

    await page.evaluate(() => { window.location.hash ='#!/docs' })
    await sleep(15)
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'Documents | Example App')

    await page.evaluate(() => { window.location.hash ='#!/books/5/summary' })
    await sleep(15)
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'BookSummary 5 | Example App')
  })
})
