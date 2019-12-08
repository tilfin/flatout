'use strict'

import { makeLFID } from '../core/util.js'
import { List } from '../model/item.js'
import { ListBinder } from '../model/binder.js'
import View from './view.js'

/**
* View for the collection of items.
*
* @example
* class ListItemView extends View {
*   html(data) {
*     return `<li>${data.title}</li>`;
*   }
* }
* 
* let instanceView = new ListView(Node, ListItemView,
*           {
*             data: [
*               { title: 'foo' },
*               { ttile: 'bar' }
*             ]
*           });
*/
class ListView extends View {

  /*
   * Create a ListView.
   *
   * @param {object} [props] - Properties
   * @param {string|Element} [props.rootEl] - root element ID or root node
   * @param {Class} [itemView] - item view class
   * @param {Class<View>} [props.parent] - parent view this belongs to
   * @param {string|Element} [props.contentEl] - parent element of child views (specified by data-id or id value).
   */
  constructor(itemView, props = {}) {
    props._F_tmpl = itemView;
    super(props);
  }

  /** @override */
  _privates() {
    const pa = super._privates();
    pa._F_itemSet = new Map();
    return pa;
  }

  /**
   * If you dynamically change creating item view according to the item, override this method.
   *
   * @param {object} item - an item
   * @return {Class<View>}
   */
  itemViewClass(item) {
    return this._F_tmpl
  }

  /**
   * Add an item to list
   *
   * @param {object} item - an item
   */
  addItem(item) {
    const view = this._createViewByItem(item);
    this.addItemEl(this.contentEl, view.el);
    return view;
  }

  /**
   * Insert an item to list at index
   *
   * @param {object} item - an item
   * @param {number} index - target position
   */
  insertItem(item, index) {
    const view = this._createViewByItem(item);
    this.insertItemEl(this.contentEl, view.el, this._childElAt(index));
    return view;
  }

  /**
   * Update an item at index
   *
   * @param {object} item - an item
   * @param {number} index - target position
   */
  updateItem(item, index) {
    const LFID = this._childElAt(index).getAttribute('_lfid_');
    this._F_itemSet.set(LFID, item);
    this.views[LFID].data = item;
  }

  /**
   * Remove item from list
   *
   * @param {object} item - an item
   * @param {number} index - target position
   */
  removeItem(item, index) {
    const el = this._childElAt(index)
    this._removeItemByEl(el);
  }

  /**
   * Remove item with view
   *
   * @param {view} view - an view of removing item
   */
  removeItemByView(view) {
    this._removeItemByEl(view.el)
  }

  /**
   * If you change adding item effect, override this method.
   *
   * @protected
   * @param {Element} listEl parent element for List
   * @param {Element} itemEl added element
   */
  addItemEl(listEl, itemEl) {
    listEl.appendChild(itemEl)
  }

  /**
   * If you change inserting item effect, override this method.
   *
   * @protected
   * @param {Element} listEl - parent element for List
   * @param {Element} newEl  - an element for new item for List
   * @param {Element} nextEl - next element will be next one for newEl
   */
  insertItemEl(listEl, newEl, nextEl) {
    listEl.insertBefore(newEl, nextEl)
  }

  /**
   * If you change removing item effect, override this method.
   *
   * @protected
   * @param {Element} listEl - parent element for List
   * @param {Element} itemEl - removed element
   */
  removeItemEl(listEl, itemEl) {
    listEl.removeChild(itemEl)
  }

  /**
   * Return child element at position.
   *
   * @param {number} index - item position.
   * @return {Element} target element
   */
  _childElAt(index) {
    return this.contentEl.children[index];
  }

  _createViewByItem(item) {
    const LFID = makeLFID();
    const cls = this.itemViewClass(item);
    const view = new cls({ data: item });
    this._F_itemSet.set(LFID, view);
    this.views[LFID] = view;
    view.el.setAttribute('_lfid_', LFID);
    return view;
  }

  /**
   * Remove item from list by element
   *
   * @param {element} el - removed element
   */
  _removeItemByEl(el) {
    const LFID = el.getAttribute('_lfid_');
    this._F_itemSet.delete(LFID);
    const vws = this.views
    vws[LFID].unload();
    delete vws[LFID];
    this.removeItemEl(this.contentEl, el);
  }

  /** @override */
  _bindData() {
    const data = this._data;
    if (data instanceof List) {
      this._F_binders.push(new ListBinder(data, this))
    }
  }

  /** @override */
  _setDataToUI() {
    if (this._data === undefined) return;
    console.log('ListView#_setDataToUI', this);

    for (let childView of Object.values(this.views)) {
      this.removeItemByView(childView);
    }

    for (let item of this._data) {
      this.addItem(item);
    }
  }
}

export default ListView
