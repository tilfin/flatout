import View from '/lib/view/view.js';
import ListView from '/lib/view/list-view.js';
import { Item } from '/lib/model/item.js';

const expect = chai.expect;

describe('View-Item', () => {
  const rootArea = new View('areaSandBox');

  beforeEach(() => {
    document.getElementById('areaSandBox').innerHTML = ''
  })

  describe('Item#add', () => {
    context("value isn't an Array", () => {
      class MyView extends View {
        html(data) {
          return `\
          <div>
            <p data-id="likes"></p>
          </div>`
        }
      }

      it('calls View#_updateField with calculated value', () => {
        const item = new Item({ likes: 0 })
        const view = new MyView({ parent: rootArea, data: item })
        expect(view.el.querySelector('p[data-id="likes"]').textContent).to.eq('0')

        item.add('likes', 5)
        expect(view.el.querySelector('p[data-id="likes"]').textContent).to.eq('5')

        item.add('likes', -1)
        expect(view.el.querySelector('p[data-id="likes"]').textContent).to.eq('4')
      })
    })

    context("value is an Array", () => {
      class ListItem extends View {
        html(data) {
          return `<li>${data}</li>`
        }
      }

      class MyView extends View {
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

      it('calls View#_updateField with the array collecting new value', () => {
        const item = new Item({ list: ['item1'] })
        const view = new MyView({ parent: rootArea, data: item })
        let textContents = Array.from(view.el.querySelectorAll('ul li')).map(el => el.textContent)
        expect(textContents).to.deep.eq(['item1'])

        item.add('list', 'item2')
        textContents = Array.from(view.el.querySelectorAll('ul li')).map(el => el.textContent)
        expect(textContents).to.deep.eq(['item1', 'item2'])
      })
    })
  })

  describe('Item#update', () => {
    class MyView extends View {
      html(data) {
        return `\
        <div>
          <h1>${data.title}</h1>
          <p data-id="description" data-type="text"></p>
          <p data-id="medium" data-type="html"></p>
        </div>`
      }
    }

    it('calls View#_updateField', () => {
      const item = new Item({
        title: 'Title1',
        description: '<b>Desc1</b>',
        medium: '<picture></picture>'
      })
      const view = new MyView({ parent: rootArea, data: item })

      expect(view.el.querySelector('h1').textContent).to.eq('Title1')
      expect(view.el.querySelector('p[data-id="description"]').textContent).to.eq('<b>Desc1</b>')
      expect(view.el.querySelector('p[data-id="medium"]').innerHTML).to.eq('<picture></picture>')

      item.update({
        title: 'TitleNotChanged',
        description: '<strong>Desc2</strong>',
        medium: '<img width="0" height="0">'
      })

      expect(view.el.querySelector('h1').textContent).to.eq('Title1') // not specified
      expect(view.el.querySelector('p[data-id="description"]').textContent).to.eq('<strong>Desc2</strong>')
      expect(view.el.querySelector('p[data-id="medium"]').innerHTML).to.eq('<img width="0" height="0">')
    })
  })

  describe('Item#toggle', () => {
    class MyView extends View {
      html(data) {
        return `\
        <div>
          <p data-id="bool"></p>
        </div>`
      }
    }

    it('calls View#_updateField with reversed value', () => {
      const item = new Item({ bool: false })
      const view = new MyView({ parent: rootArea, data: item })
      expect(view.el.querySelector('p[data-id="bool"]').textContent).to.eq('false')

      item.toggle('bool')
      expect(view.el.querySelector('p[data-id="bool"]').textContent).to.eq('true')

      item.toggle('bool')
      expect(view.el.querySelector('p[data-id="bool"]').textContent).to.eq('false')
    })
  })

  describe('Item#destroy', () => {
    class MyView extends View {
      html(data) {
        return `<div></div>`
      }
    }

    it('calls View#_updateField with reversed value', () => {
      let item = new Item()
      const view = new MyView({ parent: rootArea, data: item })
      view.data = null;
      expect(view._F_binders).to.be.empty
    })
  })
})
