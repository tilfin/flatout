const { assert, sleep } = require('../helper')

describe('Router works history mode', () => {
  let page

  beforeEach(async () => {
    page = await __BROWSER__.newPage();
  })

  afterEach(async () => {
    await page.close()
  })

  it("tour each page", async () => {
    let title, rendered, initData;

    await page.goto(`${__ENDPOINT__}/`, { waitUntil: 'networkidle2' })
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'Home | Example App')
    rendered = await page.evaluate(() => document.getElementById('rendered').textContent)
    assert.equal(rendered, 'SSR')
    assert.equal(await page.evaluate(() => document.getElementById('foo').textContent), 'FOO')
    assert.equal(await page.evaluate(() => document.getElementById('bar').textContent), 'BAR')

    await Promise.all([
      page.click('a.about'),
      page.waitForNavigation(),
    ])
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'About | Example App')

    await Promise.all([
      page.click('a.books'),
      page.waitForNavigation(),
    ])
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'BookList | Example App')

    await Promise.all([
      page.click('a.api'),
      page.waitForNavigation(),
    ])
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'API Documents | Example App')

    await Promise.all([
      page.click('a.user'),
      page.waitForNavigation(),
    ])
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'User/someone | Example App')

    await Promise.all([
      page.click('a.book'),
      page.waitForNavigation(),
    ])
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'Book5 | Example App')

    await Promise.all([
      page.click('a.usertimeline'),
      page.waitForNavigation(),
    ])
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'UserTimeline/someone | Example App')

//    await sleep(10) // wait redirect
    await Promise.all([
      page.click('a.readers'),
      page.waitForNavigation(),
    ])
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'Book3 | Example App') // books/3

    await Promise.all([
      page.click('a.reader'),
      page.waitForNavigation(),
    ])
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'BookReader id:3 reader:tom | Example App')

    await Promise.all([
      page.click('a.docs'),
      page.waitForNavigation(),
    ])
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'Documents | Example App')

    await Promise.all([
      page.click('a.summary'),
      page.waitForNavigation(),
    ])
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'BookSummary 5 | Example App')

    await Promise.all([
      page.click('a.home'),
      page.waitForNavigation(),
    ])
    title = await page.evaluate(() => document.title)
    assert.equal(title, 'Home | Example App')
    rendered = await page.evaluate(() => document.getElementById('rendered').textContent)
    assert.equal(rendered, 'CSR')
    assert.equal(await page.evaluate(() => document.getElementById('foo').textContent), '')
    assert.isNull(await page.evaluate(() => document.getElementById('bar')))
  })
})
