'use strict'

/**
 * Binding DataModel and View
 * @access private
 */
class Binder {
  /**
   * Constructor.
   * 
   * @param {Item} item - target item
   */
  constructor(item) {
    this._item = item;
    item._addListener(this);
  }

  /**
   * Remove listening to item
   */
  destroy() {
    this._item._removeListener(this);
    this._item = null;
  }
}

/**
 * Binding Item and View
 * to apply the change of item to View
 * @access protected
 */
export class ItemBinder extends Binder {
  /**
   * Constructor.
   * 
   * @param {Item} item - target data
   * @param {View} view - target view
   */
  constructor(item, view) {
    super(item)
    this._view = view;
  }

  /**
   * Updating field of view
   */
  update({ field, newValue, oldValue }) {
    this._view._updateField(field, newValue, oldValue);
  }
}

/**
 * Binding List and ListView
 * to apply the change of colleciton to ListView and its child Views
 * @access protected
 */
export class ListBinder extends Binder {
  /**
   * Constructor.
   * 
   * @param {List} collection - target data
   * @param {ListView} listView - target view
   */
  constructor(collection, listView) {
    super(collection)
    this._view = listView;
  }

  /**
   * Adding item to ListView at index.
   */
  add({ item, index }) {
    if (index === undefined) {
      this._view.addItem(item);
    } else {
      this._view.insertItem(item, index);
    }    
  }

  /**
   * Updating item of ListView at index.
   */
  update({ item, index }) {
    this._view.updateItem(item, index);
  }

  /**
   * Removing item from ListView.
   */
  remove({ item, index }) {
    this._view.removeItem(item, index);
  }
}
