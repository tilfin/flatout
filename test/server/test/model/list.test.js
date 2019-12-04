import { List, Item } from '/lib/model/item.js';

describe('List', () => {
  describe('#constructor', () => {
    context('without arguments', () => {
      it('creates an instance', () => {
        const list = new List()
        expect(list.length).to.eq(0)
        expect(list._F_itemClass).to.be.null
      })
    })

    context('with defaultData', () => {
      it('creates an instance', () => {
        const list = new List([100])
        expect(list.length).to.eq(1)
        expect(list._F_itemClass).to.be.null
      })
    })

    context('with defaultData and wrapItem = true', () => {
      it('creates an instance', () => {
        const list = new List([100, 200], { wrapItem: true })
        expect(list.length).to.eq(2)
        expect(list._F_itemClass).to.eq(Item)
      })
    })

    context('with defaultData and wrapItem = false', () => {
      it('creates an instance', () => {
        const list = new List([], { wrapItem: false })
        expect(list.length).to.eq(0)
        expect(list._F_itemClass).to.be.null
      })
    })

    context('with defaultData and wrapItem class', () => {
      class MyItem extends Item {}

      it('creates an instance', () => {
        const list = new List([1, 2], { wrapItem: MyItem })
        expect(list.length).to.eq(2)
        expect(list._F_itemClass).to.eq(MyItem)
      })
    })
  })

  describe('#get', () => {
    it('returns item at position', () => {
      const A = { c: 'A' }
      const B = { c: 'B' }
      const list = new List([A, B])
      expect(list.get(0)).to.eq(A)
      expect(list.get(1)).to.eq(B)
    })
  })

  describe('#remove', () => {
    it('removes item at position', () => {
      const list = new List([{ c: 'A' }], { wrapItem: true })
      list.remove(0)
      expect(list.length).to.eq(0)
    })
  })

  describe('#removeAll', () => {
    context('without options', () => {
      it('removes all items from head', () => {
        const A = {}, B = {}
        const list = new List([A, B])
        const deletedItems = []
        list.listened('remove', ({ item, index }) => deletedItems.push(item))
        list.removeAll()
        expect(deletedItems).to.deep.eq([A, B])
      })
    })

    context('with reverse false', () => {
      it('removes all items from head', () => {
        const A = {}, B = {}
        const list = new List([A, B])
        const deletedItems = []
        list.listened('remove', ({ item, index }) => deletedItems.push(item))
        list.removeAll()
        expect(deletedItems).to.deep.eq([A, B])
      })
    })

    context('with reverse true', () => {
      it('removes all items from last', () => {
        const A = {}, B = {}
        const list = new List([A, B])
        const deletedItems = []
        list.listened('remove', ({ item, index }) => deletedItems.push(item))
        list.removeAll()
        expect(deletedItems).to.deep.eq([B, A])
      })
    })
  })

  describe('#find', () => {
    context('with field and value', () => {
      it('returns hit item', () => {
        const A = { c: 'A' }
        const B = { v: 2 }
        const list = new List([A, B])
        expect(list.find('c', 'A')).to.eq(A)
        expect(list.find('v', 2)).to.eq(B)
        expect(list.find('f', true)).to.be.undefined
      })
    })

    context('with predicate function', () => {
      it('returns hit item', () => {
        const A = { c: 'A' }
        const B = { v: 2 }
        const list = new List([A, B])
        expect(list.find(item => item.c === 'A')).to.eq(A)
        expect(list.find(item => item.v === 2)).to.eq(B)
        expect(list.find(item => item.f === true)).to.be.undefined
      })
    })
  })

  describe('#indexOf', () => {
    context('with value', () => {
      it('returns hit item', () => {
        const list = new List(['A', 2])
        expect(list.indexOf('A')).to.eq(0)
        expect(list.indexOf(2)).to.eq(1)
        expect(list.indexOf(true)).to.eq(-1)
      })
    })

    context('with field and value', () => {
      it('returns hit item', () => {
        const A = { c: 'A' }
        const B = { v: 2 }
        const list = new List([A, B])
        expect(list.indexOf('c', 'A')).to.eq(0)
        expect(list.indexOf('v', 2)).to.eq(1)
        expect(list.indexOf('f', true)).to.eq(-1)
      })
    })

    context('with predicate function', () => {
      it('returns hit item', () => {
        const A = { c: 'A' }
        const B = { v: 2 }
        const list = new List([A, B])
        expect(list.indexOf(item => item.c === 'A')).to.eq(0)
        expect(list.indexOf(item => item.v === 2)).to.eq(1)
        expect(list.indexOf(item => item.f === true)).to.eq(-1)
      })
    })
  })

  describe('#forEach', () => {
    it('calls _data#forEach', () => {
      const A = { c: 'A' }
      const B = { v: 2 }
      const list = new List([A, B])
      const results = []
      list.forEach(item => results.unshift(item))
      expect(results).to.deep.eq([B, A])
    })
  })

  describe('#some', () => {
    it('calls _data#some', () => {
      const A = { c: 'A' }
      const B = { v: 2 }
      const list = new List([A, B])
      expect(list.some(item => item.c === 'A')).to.be.true
      expect(list.some(item => item.v === 2)).to.be.true
      expect(list.some(item => item.f === true)).to.be.false
    })
  })
})
