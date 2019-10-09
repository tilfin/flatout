'use strict'

import Core from '../core/core.js'
import { eachEntry, makeLFID } from '../core/util.js'
import { Item } from '../model/item.js'
import { ItemBinder } from '../model/binder.js'

const HOOK_EVTS = ['click', 'submit', 'change'];

/**
* View
*/
class View extends Core {

  /**
   * Create a View.
   *
   * @param {string|Element} root - Root element ID or root node
   * @param {object} [props]      - Properties
   * @param {Class<View>} [props.parent] - parent view this belongs to
   * @param {string|Element} [props.container] - parent element of child views (specified by data-id or id value).
   */
  constructor(root, props) {
    super();

    /**
     * Root element
     * @member {Node}
     */
    this.el = null;

    /**
     * Subview children of the view
     * @member {object}
     */
    this.views = {};

    if (props === undefined && root && root.constructor === Object) {
      props = root;
      root = null;
    }

    this._build(root, props || {});
  }

  /** @override */
  _privates() {
    return Object.assign(super._privates(), {
      _F_onevts: new Set(),
      _F_binders: [],
      _F_elcache: new Map()
    })
  }

  /**
   * Initialize props
   * 
   * @param {object} defaults - default data.
   * @return {object|Item} modified data or item.
   */
  init(defaults) {
  }

  /**
   * For implement creating subviews and setting listener of events.
   * 
   * @param {object} views - added subview target (ex. views.list = new ListView(..))
   */
  load(views) {
  }

  /**
   * Ssetting listener of events.
   * 
   * @param {object} evts - added listener target (ex. evts.subview_event)
   */
  handle(evts) {
  }

  /**
   * For implement unloading subviews
   */
  unload() {
  }

  /**
   * Cast a message to all children of view
   *
   * @param {string} method - method name
   * @param {Array} args - arguments
   */
  broadcast(method, args = []) {
    this._callR(args, 'views', method)
  }

  /**
   * _loaded resolve after all done
   */
  _build(root, props) {
    console.log('View#_build', root, props);

    const defaults = this._setupProps(props);
    const data = this.init(defaults);
    this._data = data !== undefined ? data : defaults;
    this._setRootNode(root, props.parent || null, this._data);
    if (this.el) this._loadFinish();
  }

  _setupProps(props) {
    let defaults;
    if (props) {
      // once detach data
      defaults = props.data;
      if ('data' in props) delete props.data;
      Object.assign(this, props);
    }
    return defaults;
  }

  /**
   * Set root node element to this.el
   */
  _setRootNode(root, parent, data) {
    if (!root && this.html) {
      this.el = root = this._buildFromHtml(data);
      if (parent) {
        // If this view doesn't belong to parent views
        parent.appendEl(root);
      }
    } else if (this._isStr(root)) {
      this.el = parent ? parent.findEl(root) : document.querySelector(root);
      if (!this.el) {
        throw new Error(`Failed to create View because element not found ID: ${root}`);
      }
    } else if (root) {
      this.el = root;
    }
  }

  _loadFinish() {
    const ctn = this.container;
    this.container = this._isStr(ctn) ? this.findEl(ctn) : this.el;

    this._loadViewsEvts();
    this._setDataToUI();
    this._bindData();
  }

  _loadViewsEvts() {
    console.log('View#_loadViewsEvts', this);

    this.load(this.views);

    eachEntry(this.views, ([name, view]) => {
      if (!view.el) {
        view.el = this.findEl(name);
        view._loadFinish();
      } else if (view.el.parentNode instanceof DocumentFragment) {
        const makerEl = this.findEl(name);
        if (makerEl) {
          // Embed view at marker if the node exists
          makerEl.parentNode.replaceChild(view.el, makerEl);
        } else {
          this.appendEl(view.el);
        }
      }
    });

    const evts = {};
    this.handle(evts);
    this._setupEvts(View._parseEvts(evts));
  }

  _bindData() {
    const data = this._data;
    if (data instanceof Item) {
      this._F_binders.push(new ItemBinder(data, this));
    }
  }

  _unbindData() {
    const binder = this._F_binders.pop();
    if (binder)  binder.destroy();
  }

  /**
   * data to elements text or value, innerHTML of elements
   *
   * @property {object} data
   * @example
   * view.data = { name: 'Mike', inputAge: { value: 24 }, message: { html: "<p>Hello!</p>" } };
   */
  get data() {
    return this._data
  }

  set data(value) {
    console.log('View#data=', this);
    this._data = value;
    this._unbindData();
    this._setDataToUI();
    this._bindData();
  }

  /**
   * Find an element that has specified data-id else call getElementById
   *
   * @param id data-id value
   * @return {Element}
   * @example
   * view.findEl('elementDataId');
   */
  findEl(id) {
    const cached = this._F_elcache[id];
    if (cached && cached.parentNode) {
      return cached;
    }
    const result = this._F_elcache[id]
      = this.el.querySelector(`[data-id="${id}"]`) || document.getElementById(id);
    return result;
  }

  /**
   * Append child element
   *
   * @param {Element} el - child element
   */
  appendEl(el) {
    this.container.appendChild(el)
  }

  /**
   * Add child view as name
   *
   * @param {string} name - child name
   * @param {View} view - child view
   * @example
   * parent.add('child', view);
   */
  add(name, view) {
    this.views[name] = view;
    this.appendEl(view.el);
  }

  /**
   * Remove child view by name
   *
   * @param {string} viewName - child view name
   * @example
   * parent.remove('child');
   */
  remove(viewName) {
    const view = this.views[viewName];
    view.destroy();
    view.el.remove();
    delete this.views[viewName]
  }

  /**
   * Fire event
   *
   * @param {string} name - event name
   * @param {object} ctx - event context
   * @example
   * view.fire('move', { newPosition: 1 });
   */
  fire(name, ctx) {
    const e = ctx ? new CustomEvent(name, { detail: ctx, bubbles: true })
                : new Event(name, { bubbles: true });
    this.el.dispatchEvent(e);
  }

  /**
   * Destroy all chidren, unload, and destroy binder, teardown events
   */
  destroy() {
    this.unload();

    Object.values(this.views).forEach(it => it.destroy());
    this.views = {};
    this._F_elcache.clear();
    this._unbindData();
    this._teardownEvts();
    this.parent = null;
  }

  /**
   * Set data to subviews or elements in the view.
   */
  _setDataToUI() {
    const data = this._data;
    if (data === undefined || !(data instanceof Object)) return;
    console.log('View#_setDataToUI', this);

    eachEntry(this._data, ([name, val]) => {
      this._setFieldValue(name, val)
    })
  }

  _updateField(name, newValue, oldValue) {
    this._setFieldValue(name, newValue)
  }

  _setFieldValue(name, val) {
    if (name in this.views) {
      this.views[name].data = val;
      return;
    }

    const el = this.findEl(name);
    if (!el) return;

    if (el.dataset && el.dataset.type === 'html') {
      el.innerHTML = val;
    } else if ('value' in el) {
      el.value = val;
    } else {
      el.textContent = val;
    }
  }

  // private

  _setupEvts(evtMap) {
    eachEntry(evtMap, ([target, hmap]) => {
      if (target === '_') {
        this._setEvts(this.el, hmap);
        return;
      }

      const el = this.findEl(target);
      if (!el) {
        console.log(`Not found event target ${target}`);
        return;
      }

      const ts = el instanceof NodeList ? Array.from(el) : [el];
      ts.forEach(t => this._setEvts(t, hmap));
    })
  }

  /**
   * Bind targets with event handler set.
   *
   * @param {Element} el - event raiser.
   * @param {object} hmap - handler map. Object<type, value>
   */
  _setEvts(el, hmap) {
    eachEntry(hmap, ([type, handler]) => {
      this._trapEvt(this, el, type, handler);
    })
  }

  /**
   * Bind target event with handler.
   *
   * @param {View} root - caller
   * @param {Element} el - event raiser
   * @param {string} type - event type
   * @param {function} handler - callback function
   */
  _trapEvt(root, el, type, handler) {
    const hook = function(e) {
      const rb = handler.call(root, this, e);
      return rb !== undefined ? rb : false;
    };

    if (HOOK_EVTS.includes(type)) {
      el['on'+type] = hook;
    } else {
      el.addEventListener(type, hook);
    }
    this._F_onevts.add([el, type, hook]);
  }

  _teardownEvts() {
    const onevts = this._F_onevts;
    onevts.forEach(([el, type, hook]) => {
      if (HOOK_EVTS.includes(type)) {
        el['on'+type] = null;
      } else {
        el.removeEventListener(type, hook);
      }
    });
    onevts.clear();
  }

  _buildFromHtml(data) {
    const el = document.createElement('template');
    el.innerHTML = this.html(data || {});
    const df = document.adoptNode(el.content);
    return this._firstEl(df);
  }

  _firstEl(el) {
    const fec = el.firstElementChild;
    if (fec !== undefined) return fec;

    // for Safari, Edge
    const nodes = el.childNodes;
    for (let i = 0, len = nodes.length; i < len; i++) {
      const child = nodes[i];
      if (child.nodeType === Node.ELEMENT_NODE) return child;
    }
    return null;
  }

  // static

  static _parseEvts(handlers) {
    const emap = { _: {} };

    eachEntry(handlers, ([name, handler]) => {
      const pos = name.lastIndexOf('_');
      if (pos === -1) {
        emap._[name] = handler;
        return;
      }

      // ex) button_click
      const target = name.substr(0, pos),
            ename = name.substr(pos + 1),
            hmap = emap[target];
      if (hmap) {
        hmap[ename] = handler;
      } else {
        emap[target] = { [ename]: handler };
      }
    })

    return emap;
  }
}

export default View;
