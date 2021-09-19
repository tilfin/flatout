import View from '/lib/view/view.js';
import { Item } from '/lib/model/item.js';

const expect = chai.expect;

class SubView extends View {
  html(data) {
    return `\
      <div>
        <h1>${data.title}</h1>
        <p>${data.note}</p>
        <div>
          <a href="${data.linkURL}">link</a>
          <img alt="${data.imageAlt}" src="${data.imageURL}">
        </div>
      </div>`;
  }
}

describe('View', () => {
  let data, domView;

  beforeEach(() => {
    data = { message: "Good evening." };

    const t = document.querySelector('#fixtureView')
    const clone = document.importNode(t.content, true)
    domView = clone.firstElementChild
    document.body.appendChild(domView)
  })

  afterEach(() => {
    domView.parentNode.removeChild(domView)
  })

  it('creates new instance', () => {
    const view = new View({ rootEl: 'theView' })
    expect(view.el.id).to.eq('theView')
    expect(view.findEl('message').textContent).to.include('Hello!')
  })

  it('creates new instance with prop', () => {
    const view = new View({ rootEl: 'theView', prop1: 100 })
    expect(view.el.id).to.eq('theView')
    expect(view.findEl('message').textContent).to.include('Hello!')
    expect(view.prop1).to.eq(100)
  })

  it('creates new instance expanding data of prop', () => {
    const view = new View({ rootEl: 'theView', data })
    expect(view.el.id).to.eq('theView')
    expect(view.findEl('message').textContent).to.include(data.message)
  })

  it('creates new instance with load', () => {
    var load = chai.spy();

    const view = new View({ rootEl: 'theView', load })
    expect(view.el.id).to.eq('theView')
    expect(view.findEl('message').textContent).to.include('Hello!')
    expect(load).to.have.been.called
  })

  it('creates new instance with prop that contains data and load', () => {
    var load = chai.spy();

    const view = new View({ rootEl: 'theView', prop1: 100, data }, load)
    expect(view.el.id).to.eq('theView')
    expect(view.findEl('message').textContent).to.include(data.message)
    expect(view.prop1).to.eq(100)
    expect(load).to.have.been.called
  })

  it('creates new instance with prop that contains data and load', () => {
    var clickHandler = chai.spy();

    class AView extends View {
      handle(evts) {
        evts.sayButton_click = clickHandler;
      }
    }

    const view = new AView({ rootEl: 'theView', prop1: 100, data })
    view.findEl('sayButton').dispatchEvent(new Event('click'))

    expect(view.el.id).to.eq('theView');
    expect(view.findEl('message').textContent).to.include(data.message);
    expect(view.prop1).to.eq(100);

    expect(clickHandler).to.have.been.called.with(view.findEl('sayButton'));
  })

  it('handles async event handler', () => {
    let clickDone = chai.spy();

    class AView extends View {
      handle(evts) {
        evts.sayButton_click = async () => {
          clickDone();
        }
      }
    }

    const view = new AView({ rootEl: 'theView', prop1: 100, data })
    view.findEl('sayButton').dispatchEvent(new Event('click'))

    setTimeout(() => {
      expect(clickDone).to.have.been.called()
    }, 0)
  })

  describe('#set', () => {
    it('set attached handle evts', () => {
      let clickHandler = chai.spy();

      class FooView extends View {
        html() {
          return `<input id="foo">`
        }
      }

      class TestView extends View {
        prepareData() {
          return new Item({ foo: 'initFooValue' })
        }

        handle(evts) {
          evts.foo_click = clickHandler
        }

        completed() {
          this.set('foo', new FooView())
        }
      }

      const view = new TestView({ rootEl: 'theView' })
      expect(view.findEl('foo').value).to.eq('') // initFooValue not applied
      view.findEl('foo').dispatchEvent(new Event('click'))
      expect(clickHandler).to.have.been.called.with(view.findEl('foo'));
      view.data.update({ foo: 'newFooValue' })
      expect(view.findEl('foo').value).to.eq('newFooValue')
    })
  })

  describe('data=', () => {
    it('causes to render field contents', () => {
      const view = new View({ rootEl: 'theView' })
      expect(view.el.querySelector('span[data-id="remarkText"]').textContent).to.eq('')
      expect(view.el.querySelector('span[data-id="remarkHtml"]').innerHTML).to.eq('')

      view.data = { message: 'Hi!', remarkText: '<b>REMARK1</b>', remarkHtml: '<b>REMARK2</b>' }
      expect(view.findEl('message').textContent).to.eq('Hi!')
      expect(view.el.querySelector('span[data-id="remarkText"]').textContent).to.eq('<b>REMARK1</b>')
      expect(view.el.querySelector('span[data-id="remarkHtml"]').innerHTML).to.eq('<b>REMARK2</b>')
    })
  })

  describe('SubView extends View', () => {
    it('creates an SubView instance', () => {
      var load = chai.spy();

      class SubView extends View {
        load(views) {
          load();
        }
      }

      expect(load).not.to.have.been.called

      const view = new SubView({ rootEl: 'theView' })
      expect(view.el.id).to.eq('theView')
      expect(view.findEl('message').textContent).to.include('Hello!')
      expect(load).to.have.been.called
    })

    it('defines SubView with DOM id and creates an instance of SubView', async () => {
      const view = new SubView({
          data: {
            title: 'Title',
            note: 'Note',
            linkURL: 'https://example.com/',
            imageAlt: 'Image',
            imageURL: 'http://localhost/image.png'
          }
        })

      expect(view.el.querySelector('h1').textContent).to.eq('Title')
      expect(view.el.querySelector('p').textContent).to.eq('Note')
      expect(view.el.querySelector('a').href).to.eq('https://example.com/')
      expect(view.el.querySelector('img').alt).to.eq('Image')
      expect(view.el.querySelector('img').src).to.eq('http://localhost/image.png')
    })
  })

  it('creates new instance expanding data of prop for template DOM', async () => {
    const view = new SubView({
        data: {
          title: 'Title',
          note: 'Note',
          linkURL: 'https://example.com/',
          imageAlt: 'Image',
          imageURL: 'http://localhost/image.png'
        }
      })

    expect(view.el.querySelector('h1').textContent).to.eq('Title')
    expect(view.el.querySelector('p').textContent).to.eq('Note')
    expect(view.el.querySelector('a').href).to.eq('https://example.com/')
    expect(view.el.querySelector('img').alt).to.eq('Image')
    expect(view.el.querySelector('img').src).to.eq('http://localhost/image.png')
  })
})
