const { assert, sleep } = require('../helper')
const pti = require('puppeteer-to-istanbul')

describe('Inner tests', () => {
  let page

  beforeEach(async () => {
    page = await __BROWSER__.newPage()
    page.coverage.startJSCoverage()
  })

  afterEach(async () => {
    let coverages = await page.coverage.stopJSCoverage()
    coverages = coverages.filter(cvrg => {
      return cvrg.url.match(/\/lib\/.+\.js/) != null
    })
    pti.write(coverages)
    await page.close()
  })

  it("run", async () => {
    await page.goto(`${__ENDPOINT__}/test/`, { waitUntil: 'networkidle2' })
    await sleep(5000) // please adjust for test volume
    const result = await page.evaluate(() => {
                      return {
                        stats: document.querySelector('#mocha-stats').textContent,
                        report: document.querySelector('#mocha-report').textContent
                      }
                    })
    const md = result.stats.match(/passes\: (\d+)failures\: (\d+)duration\: ([0-9.]+)/)
    const failing = Number(md[2])
    console.info('   ', md[1], 'passing ', failing, 'failing ', 'duration:', md[3], 'sec')

    if (failing > 0) {
      console.info(result.report)
    }
    assert.equal(failing, 0, 'Some test failing')
  })
})
