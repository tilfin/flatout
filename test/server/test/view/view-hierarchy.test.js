import View from '/lib/view/view.js';

const expect = chai.expect;

class TestArea extends View {
  html(data) {
    return `\
    <div id="testArea">
      <h1>${data.title}</h1>
      <main data-id="contentBox"></main>
    </div>`;
  }
}

class TestSubArea extends View {
  html(data) {
    return `<div><h2>${data.title}</h2></div>`;
  }
}

describe('View hierarchy', () => {
  afterEach(() => {
    document.getElementById('areaSandBox').innerHTML = ''
  })

  describe('Root element specified by element ID', () => {
    it('View.el is valid', () => {
      const testArea = new View('areaSandBox')
      expect(document.getElementById('areaSandBox')).to.eq(testArea.el)
    })
  })

  describe('append to parent element', () => {
    it('appends area to parent element', () => {
      const testArea = new TestArea({ data: { title: 'AreaTitle' }})
      document.getElementById('areaSandBox').appendChild(testArea.el)

      expect(document.getElementById('testArea')).to.eq(testArea.el)
      expect(testArea.el.querySelector('h1').textContent).to.eq('AreaTitle')

      testArea.destroy()
    })
  })

  describe('appendEl', () => {
    context('container is specified by string', () => {
      it('appends child area to container of parent area', () => {
        const testArea = new TestArea({ container: 'contentBox' })
        document.getElementById('areaSandBox').appendChild(testArea.el)

        const testSubArea = new TestSubArea({
          parent: testArea,
          data: { title: 'SubAreaTitle'}
        })
        expect(testSubArea.el.parentElement).to.eq(document.body.querySelector('[data-id="contentBox"]'))
        expect(testSubArea.el.querySelector('h2').textContent).to.eq('SubAreaTitle')

        testArea.destroy()
        expect(testArea.parent).to.be.null
      })
    })
  })
})
