'use strict';

import { eachEntry } from '../core/util.js'
import Core from '../core/core.js';

/**
 * Item.
 * this can be an element of List.
 * 
 * @memberOf Lfin
 */
export class Item extends Core {

  /**
   * Constructor.
   * 
   * @param {object} [defaultData] - default data
   */
  constructor(defaultData = {}) {
    super();
    Object.assign(this, defaultData);
  }

  /**
   * Add value to field-value.
   * 
   * @param {string} field - adding field name
   * @param {Any} value - adding value
   */
  add(field, value) {
    const cur = this[field];
    const isArr = cur !== undefined && cur instanceof Array;
    let newVal;
    if (isArr) {
      cur.push(value);
      newVal = cur;
    } else {
      newVal = cur + value;
    }
    this._updateField(field, newVal);
  }

  /**
   * Toggle boolean field-value
   * 
   * @param {string} field - toggling field name
   */
  toggle(field) {
    const cur = Boolean(this[field]);
    this._updateField(field, !cur);
  }

  /**
   * Update the pairs of field-value.
   * 
   * @param {Object} pairs - updating target pairs
   */
  update(pairs) {
    eachEntry(pairs, ([key, val]) => this._updateField(key, val))
  }

  /**
   * Destroy me.
   */
  destroy() {
    this.say('destroy', {});
  }

  /**
   * Update field with value.
   * 
   * @param {string} field - updating target
   * @param {Any} value    - new value
   */
  _updateField(field, value) {
    const cur = this[field];

    if (cur instanceof Item) {
      if (cur instanceof List) {
        cur.reset(value)
      } else {
        cur.update(value)
      }
    } else {
      this[field] = value;
      this.say('update', { field, newValue: value, oldValue: cur });
    }
  }

  _addListener(target) {
    this.listen('*', target);
  }

  _removeListener(target) {
    this.unlisten('*', target);
  }
}

/**
 * List for plain object or Item.
 *
 * @memberOf Lfin
 */
export class List extends Item {

  /**
   * Constructor.
   * 
   * @param {Array} [defaultData] - default data array
   * @param {object} [opts] - options
   * @param {boolean|Class<Item>} [opts.wrapItem] - Whether wrapping Item or not, or the sub class of Item.
   */
  constructor(defaultData = [], opts = {}) {
    super();

    if (opts.wrapItem) {
      if (opts.wrapItem === true) {
        this._F_itemClass = Item;
      } else {
        this._F_itemClass = opts.wrapItem;
      }
    } else {
      this._F_itemClass = null;
    }

    this._data = defaultData.map(item => this._wrapItem(item));
  }

  /**
   * If you dynamically change wrapping item class according to the item, override this method.
   *
   * @param {object} item - an item
   * @return {Class<View>}
   */
  itemClass(item) {
    return this._F_itemClass
  }

  /**
   * Return an item at position.
   * 
   * @param  {number} index - item position.
   * @return {*} item specified by index.
   */
  get(index) {
    return this._data[index];
  }

  /**
   * Add an item.
   * 
   * @param {Any} item - item
   * @param {number} [insertIndex] - optional insert position, add last if not defined
   */
  add(item, insertIndex) {
    item = this._wrapItem(item);
    if (insertIndex === undefined) {
      this._data.push(item);
    } else {
      this._data.splice(insertIndex, 0, item);
    }
    this.say('add', { item, index: insertIndex });
  }

  /**
   * Update an item at index.
   * 
   * @param {Any} item - item
   * @param {number} index - target index
   */
  update(item, index) {
    if (index === undefined) {
      // for when item updated
      index = this._data.indexOf(item);
    }
    const cur = this._data[index];
    if (cur !== item) {
      item = this._wrapItem(item);
      this._data[index] = item;
    }
    this.say('update', { item, index });
  }

  /**
   * Remove an item (specified by index).
   * 
   * @param {object|number} itemOrIndex - target item or the position.
   */
  remove(itemOrIndex) {
    let index;
    if (typeof itemOrIndex !== 'number') {
      index = this._data.indexOf(itemOrIndex) // find item
    } else {
      index = itemOrIndex;
    }
    const item = this._data.splice(index, 1)[0];
    this.say('remove', { item, index });
  }

  /**
   * Add items.
   * 
   * @param {Array} items - adding items
   * @param {number} [insertIndex] - insert position
   */
  addAll(items, insertIndex) {
    items.forEach(item => this.add(item, insertIndex))
  }

  /**
   * Remove all items.
   * 
   * @param {Object} opts - if opts.reverse is true, removing from last to first.
   */
  removeAll(opts = {}) {
    const { reverse = false } = opts;
    if (reverse) {
      for (let idx = this.length - 1; idx >= 0; idx--) {
        this.remove(idx);
      }
    } else {
      while(this._data.length) {
        this.remove(0);
      }
    }
  }

  /**
   * Remove last item.
   */
  removeLast() {
    this.remove(this.length - 1);
  }

  /**
   * replace all items
   *
   * @param {Array} [newValues] - new values or default empty array
   */
  reset(newValues = []) {
    this.removeAll();
    this.addAll(newValues);
  }

  /**
   * Iterates each item of self, return an index of the first item predicate returns true.
   * 
   * @param  {string|Function} predictOrField - predicate function or target field
   * @param  {*} [value] - finding value for target field
   * @return {object} matched first item or undefined
   */
  find(predictOrField, value) {
    const i = this.indexOf(predictOrField, value);
    return i >= 0 ? this._data[i] : undefined;
  }

  /**
   * Iterates each item of self, return the first item predicate returns true.
   * 
   * @param  {string|Function|Object} predictOrField - predicate function or target field, target object
   * @param  {*} [value] - finding value for target field
   * @return {number} matched first item index or -1 if not found
   */
  indexOf(predictOrField, value) {
    let judge;
    if (value !== undefined) {
      judge = it => it[predictOrField] === value
    } else if (this._isFn(predictOrField)) {
      judge = predictOrField;
    } else {
      return this._data.indexOf(predictOrField)
    }

    for (let i = 0, len = this._data.length; i < len; i++) {
      if (judge(this._data[i])) return i;
    }
    return -1;
  }

  /*
   * forEach method for data
   * @param {Function} cb - callback.
   */
  forEach(cb) {
    this._data.forEach(cb)
  }

  /*
   * some method for data
   * @param {Function} cb - callback returns true or false.
   */
  some(cb) {
    return this._data.some(cb)
  }

  /*
   * Data size
   * @type {number}
   */
  get length() {
    return this._data.length
  }

  /*
   * @return {Iterator} data iterator
   */
  [Symbol.iterator]() {
    return this._data[Symbol.iterator]()
  }

  /**
   * Wrap an item by Item class
   */
  _wrapItem(item) {
    if (!(item instanceof Item)) {
      const cls = this.itemClass(item);
      if (cls) {
        return new cls(item);
      }
    }
    return item;
  }
}
