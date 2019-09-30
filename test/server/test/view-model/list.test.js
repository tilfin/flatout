import View from '/lib/view/view.js';
import ListView from '/lib/view/list-view.js';
import { Item, List } from '/lib/model/item.js';

const expect = chai.expect;

describe('ListView-List', () => {
  const rootArea = new View('areaSandBox');

  beforeEach(() => {
    document.getElementById('areaSandBox').innerHTML = ''
  })

  class ListData extends View {
    html(data) {
      return `<li>${data}</li>`
    }
  }

  class ListItem extends View {
    html(data) {
      return `\
      <li><span data-id="c"></span><span data-id="v"></span></li>`
    }
  }

  class DataListView extends View {
    html(data) {
      return `\
      <div>
        <ul data-id="list"></ul>
      </div>`
    }

    load(views) {
      views.list = new ListView(ListData)
    }
  }

  class ItemListView extends View {
    html(data) {
      return `\
      <div>
        <ul data-id="list"></ul>
      </div>`
    }

    load(views) {
      views.list = new ListView(ListItem)
    }
  }

  describe('List#add', () => {
    context("without index", () => {
      it('calls View#addItem', () => {
        const collection = new List([])
        const view = new DataListView({ parent: rootArea, data: { list: collection }})
        const ul = view.views.list.el;

        let textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
        expect(textContents).to.be.empty

        collection.add('str')
        textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
        expect(textContents).to.deep.eq(['str'])

        collection.add(100)
        textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
        expect(textContents).to.deep.eq(['str', '100'])
      })
    })

    context("with index", () => {
      it('calls View#insertItem at specified position', () => {
        const collection = new List(['A', 'B'])
        const view = new DataListView({ parent: rootArea, data: { list: collection }})
        const ul = view.views.list.el;

        let textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
        expect(textContents).to.deep.eq(['A', 'B'])

        collection.add('AB', 1)
        textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
        expect(textContents).to.deep.eq(['A', 'AB', 'B'])

        collection.add('_A', 0)
        textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
        expect(textContents).to.deep.eq(['_A', 'A', 'AB', 'B'])

        collection.add('B_', 4)
        textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
        expect(textContents).to.deep.eq(['_A', 'A', 'AB', 'B', 'B_'])
      })
    })
  })

  describe('List#update', () => {
    it('calls View#updateItem at specified position', () => {
      const collection = new List([{ c: 'K', v: 13 }, { c: 'J', v: 11 }])
      const view = new ItemListView({ parent: rootArea, data: { list: collection }})
      const ul = view.views.list.el;

      let textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
      expect(textContents).to.deep.eq(['K13', 'J11'])

      collection.update({ c: 'Q', v: 12 }, 0)
      textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
      expect(textContents).to.deep.eq(['Q12', 'J11'])

      collection.update({ c: 'JQ' }, 1)
      textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
      expect(textContents).to.deep.eq(['Q12', 'JQ11']) // c only updated
    })
  })

  describe('List#remove', () => {
    context('with entity', () => {
      it('calls View#removeItem', () => {
        const king = { c: 'K', v: 13 }
        const queen = { c: 'Q', v: 12 }
        const collection = new List([king, queen])
        const view = new ItemListView({ parent: rootArea, data: { list: collection }})
        const ul = view.views.list.el;

        collection.remove(queen)
        let textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
        expect(textContents).to.deep.eq(['K13'])
      })
    })

    context('with index', () => {
      it('calls View#removeItem', () => {
        const collection = new List(['A', 'B'])
        const view = new DataListView({ parent: rootArea, data: { list: collection }})
        const ul = view.views.list.el;

        collection.remove(0)
        let textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
        expect(textContents).to.deep.eq(['B'])
      })
    })
  })

  describe('List#removeAll', () => {
    it('calls View#removeItem repeatedly', () => {
      const collection = new List(['A', 'B'])
      const view = new DataListView({ parent: rootArea, data: { list: collection }})
      const ul = view.views.list.el;

      collection.removeAll()
      let textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
      expect(textContents).to.empty
    })
  })

  describe('List#removeLast', () => {
    it('calls View#removeItem', () => {
      const collection = new List(['A', 'B'])
      const view = new DataListView({ parent: rootArea, data: { list: collection }})
      const ul = view.views.list.el;

      collection.removeLast()
      let textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
      expect(textContents).to.deep.eq(['A'])
    })
  })

  describe('List#reset', () => {
    context('with newValues', () => {
      it('calls View#removeItem and View#insertItem repeatedly', () => {
        const collection = new List(['A', 'B'])
        const view = new DataListView({ parent: rootArea, data: { list: collection }})
        const ul = view.views.list.el;

        collection.reset(['C', 'D'])
        let textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
        expect(textContents).to.deep.eq(['C', 'D'])
      })
    })

    context('without newValues', () => {
      it('calls View#removeItem repeatedly', () => {
        const collection = new List(['A', 'B'])
        const view = new DataListView({ parent: rootArea, data: { list: collection }})
        const ul = view.views.list.el;

        collection.reset()
        let textContents = Array.from(ul.querySelectorAll('li')).map(el => el.textContent)
        expect(textContents).to.be.empty
      })
    })
  })
})
