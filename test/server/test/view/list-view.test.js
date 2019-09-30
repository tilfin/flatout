import ListView from '/lib/view/list-view.js';
import View from '/lib/view/view.js';

describe('ListView', () => {
  let domView;

  beforeEach(() => {
    const t = document.querySelector('#fixtureList')
    const clone = document.importNode(t.content, true)
    domView = clone.firstElementChild
    document.body.appendChild(domView)
  })

  afterEach(() => {
    domView.parentNode.removeChild(domView)
  })

  class ListItemView extends View {
    html(data) {
      return `<li><input type="checkbox" class="checkBox">${data.title}</li>`;
    }
  }

  it('creates new instance', async () => {
    const list = new ListView(document.getElementById('theList'))
    expect(list.el.id).to.eq('theList')
  })

  it('creates new instance with prop', async () => {
    const list = new ListView(document.getElementById('theList'), ListItemView, { prop1: 100, prop2: 'foo' })
    expect(list.el.id).to.eq('theList')
    expect(list.prop1).to.eq(100)
    expect(list.prop2).to.eq('foo')
  })

  it('creates new instance expanding data of prop', async () => {
    const list = new ListView(document.getElementById('theList'), ListItemView, { data: [] })
    expect(list.el.id).to.eq('theList')

    list.data = [{
      title: 'Item A'
    }, {
      title: 'Item B'
    }]
    await sleep(1)
    expect(document.querySelector('#theList li:nth-child(1)').textContent).to.eq('Item A')
    expect(document.querySelector('#theList li:nth-child(2)').textContent).to.eq('Item B')
  })

  it('creates new instance with fields, data and load', async () => {
    class AListView extends ListView {}

    const list = new AListView(document.getElementById('theList'), ListItemView, {
        prop1: 100,
        data: [{
          title: 'Key'
        }, {
          title: 'Micheal'
        }, {
          title: 'Cindy'
        }]
      })
    await sleep(1)
    expect(list.el.id).to.eq('theList')
    expect(list.prop1).to.eq(100)
  })

  describe('extends ListView', () => {
    it('creates a subclass of ListView', async () => {
      const loadSpy = chai.spy();

      class SubListView extends ListView {
        constructor() {
          super(document.getElementById('theList'), ListItemView);
        }

        load(views) {
          loadSpy();
        }
      }

      expect(loadSpy).not.to.have.been.called

      const list = new SubListView()
      list.data = [{
        title: 'Item 1'
      }]
      await sleep(1)
      expect(list.el.id).to.eq('theList')
      expect(loadSpy).to.have.been.called
    })
  })
})
