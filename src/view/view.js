'use strict'

import Core from '../core/core.js'
import { eachEntry } from '../core/util.js'
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
   * @param {object} [props] - Properties
   * @param {string|Element} [props.rootEl] - root element ID or root node
   * @param {Class<View>} [props.parent] - parent view this belongs to
   * @param {string|Element} [props.contentEl] - parent element of child views (specified by data-id or id value).
   */
  constructor(props = {}) {
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

    /**
     * Whether server side rendering or not
     * @member {boolean}
     */
    this.isSSR = false

    const { rootEl, ...props_ } = props;
    this._build(rootEl, props_);
  }

  /** @override */
  _privates() {
    return Object.assign(super._privates(), {
      _F_onevts: new Set(),
      _F_binders: [],
      _F_elcache: new Map(),
      _F_emap: { _: {} },
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
   * For implement after loading completed
   */
  completed() {
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
    if (this._isStr(root)) {
      root = parent ? parent.findEl(root) : document.getElementById(root);
      if (!root) {
        throw new Error(`Failed to create View because element not found ID: ${root}`);
      }
    }

    if (!this.isSSR && this.html) {
      this.el = this._buildFromHtml(data);
      if (parent) {
        // If this view doesn't belong to parent views
        parent.appendEl(this.el);
      } else if (root) {
        root.parentNode.replaceChild(this.el, root);
      }
    } else if (root) {
      this.el = root;
    }
  }

  _loadFinish() {
    const ctn = this.contentEl;
    this.contentEl = this._isStr(ctn) ? this.findEl(ctn) : this.el;

    this._loadViewsEvts();
    this._setDataToUI();
    this._bindData();

    this.completed();
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

    const evts = {}, emap = this._F_emap;
    this.handle(evts);
    this._parseEvts(evts, emap);

    // attach events to current views
    eachEntry(emap, ([target, hmap]) => {
      if (target === '_') {
        this._setEvts(this.el, hmap);
        return;
      }

      const el = this.findEl(target);
      if (!el) return;

      this._setEvts(el, hmap)
    })
  }

  _bindData() {
    const data = this._data;
    if (data instanceof Item) {
      this._F_binders.push(new ItemBinder(data, this));
    }
  }

  _unbindData() {
    const binder = this._F_binders.pop();
    if (binder) binder.destroy();
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
    const cached = this._F_elcache.get(id);
    if (cached && cached.parentNode) {
      return cached;
    }
    const result = this.el.querySelector(`[data-id="${id}"]`) || document.getElementById(id);
    this._F_elcache.set(id, result);
    return result;
  }

  /**
   * Append child element
   *
   * @param {Element} el - child element
   */
  appendEl(el) {
    this.contentEl.appendChild(el)
  }

  /**
   * Set child view as name after load
   *
   * @param {string} name - view name
   * @param {View} view - child view. remove if null
   * @example
   * parent.set('name', view);
   */
  set(name, view) {
    const t = this, curvw = t.views[name];
    if (curvw) {
      curvw.destroy();
      curvw.el.remove();
      delete t.views[name];
    }
    if (view) {
      t.views[name] = view;
      t.appendEl(view.el);
      t._setEvts(view.el, t._F_emap[name] || {})
    }
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
   * Called when the binding data is updated.
   * 
   * @param {string} name field name
   * @param {*} newValue new data value
   * @param {*} oldValue old data value
   * @return {boolean} true if setting field value succeeded
   */
  update(name, newValue, oldValue) {
    return this._setFieldValue(name, newValue)
  }

  /**
   * Set data to subviews or elements in the view.
   */
  _setDataToUI() {
    const data = this._data;
    if (data === undefined) return;
    console.log('View#_setDataToUI', this);

    if (data instanceof Object) {
      eachEntry(data, ([name, val]) => this._setFieldValue(name, val))
    } else {
      this._setVal(this.el, data)
    }
  }

  _setFieldValue(name, val) {
    const it = this.views[name];
    if (it) {
      it.data = val;
      return true;
    }

    const el = this.findEl(name);
    if (!el) return false;

    this._setVal(el, val)
    return true;
  }

  // private

  _setVal(el, val) {
    if (el.dataset && el.dataset.type === 'html') {
      el.innerHTML = val;
    } else if ('value' in el) {
      el.value = val;
    } else {
      el.textContent = val;
    }
  }

  _parseEvts(evts, emap) {
    eachEntry(evts, ([name, handler]) => {
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
  }

  /**
   * Bind targets with event handler set.
   *
   * @param {Element} el - event raiser.
   * @param {object} hmap - handler map. Object<type, value>
   */
  _setEvts(el, hmap) {
    const ts = el instanceof NodeList ? Array.from(el) : [el];
    eachEntry(hmap, ([type, handler]) => {
      ts.forEach(it => this._trapEvt(this, it, type, handler))
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
      let rb;
      try {
        rb = handler.call(root, this, e)
      } catch(err) {
        console.error(err)
      }
      return rb !== undefined ? rb : false
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
}

export default View;
