import { Item, List } from '/lib/model/item.js';

describe('Item', () => {
  describe('#constructor', () => {
    context('without arguments', () => {
      it('creates an instance', () => {
        expect(new Item()).to.exist
      })
    })

    context('with defaultData', () => {
      it('creates an instance', () => {
        const parent = new Item()
        const item = new Item({ c: 1 })
        expect(item.c).to.eq(1)
      })
    })
  })

  describe('#add', () => {
    context('its value is a number', () => {
      it('adds new value to old value', () => {
        const item = new Item({ count: 2 })
        item.listen('update', ({ field, newValue, oldValue }) => {
          expect(field).to.eq('count')
          expect(newValue).to.eq(5)
          expect(oldValue).to.eq(2)
        })
        item.add('count', 3)
        expect(item.count).to.eq(5)
      })
    })

    context('its value is an array', () => {
      it('pushes new value to its array', () => {
        const item = new Item({ array: [1] })
        item.listen('update', ({ field, newValue, oldValue }) => {
          expect(field).to.eq('array')
          expect(newValue).to.deep.eq([1, 2])
          expect(oldValue).to.deep.eq([1, 2]) // Destruction
        })
        item.add('array', 2)
        expect(item.array).to.deep.eq([1, 2])
      })
    })
  })

  describe('#update', () => {
    it('updates each fields that propagates if its value is an Item', () => {
      const props = new Item()
      const tags = new List()
      const item = new Item({ title: 'Title', props, tags })

      item.update({ title: 'Changed', props: { c: 'A' }, tags: ['TAG'] })
      expect(item.title).to.eq('Changed')
      expect(props.c).to.eq('A')
      expect(tags.get(0)).to.eq('TAG')
    })
  })
})
