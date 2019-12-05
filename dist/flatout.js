/** @private */
function eachEntry(obj, cb) {
  Object.entries(obj).forEach(cb);
}

function* idCounter() {
  let i = 0;
  while (true) yield i++;
}

const lfidCounter = idCounter();

/** @private */
function makeLFID() {
  const v = lfidCounter.next().value;
  return `_F_${v}`
}

/**
 * Core
 */
class Core {
  /**
   * Create a Core.
   */
  constructor() {
    const dp = {};
    eachEntry(this._privates(), ([key, value]) => {
      dp[key] = { value };
    });
    Object.defineProperties(this, dp);
  }

  /**
   * Return non-enumerable attribute definitions.
   *
   * @access private
   */
  _privates() {
    return { _F_obs: new Map() }
  }

  /**
   * Add handler or listener for saying message
   *
   * @param {string|Object} nameOrObj - message name, '*' specify any listener.
   * @param {Function} handler - handler called on message received or listener.
   * @example
   * core.listened('*', function(){});
   * core.listened('evtName1', function(){});
   * core.listened({ evtName2: function(){}, evtName3: function(){} })
   */
  listened(nameOrObj, handler) {
    if (handler) {
      this._listened(nameOrObj, handler);
    } else {
      eachEntry(nameOrObj, ([name, handler]) => this._listened(name, handler));
    }
  }

  /**
   * Remove handler or listener
   *
   * @param {string} name - message name, '*' specify any listener.
   * @param {Function|object} handler - handler registered or listener registered.
   */
  unlistened(name, handler) {
    const set = this._F_obs.get(name);
    if (set) set.delete(handler);
  }

  /**
   * Unescape HTML
   * @param  {String} escaped HTML string
   * @return {String}         raw HTML string
   */
  unescapeHtml(escaped) {
    const doc = new DOMParser().parseFromString(escaped, "text/html");
    return doc.documentElement.textContent;
  }

  /**
   * Cast a message to the listeners
   *
   * @param {string} name - message name
   * @param {*} ctx - passing value
   */
  say(name, ctx) {
    this._say(name, name, ctx);
    this._say('*', name, ctx);
  }

  // protected scope

  _listened(name, handler) {
    const set = this._F_obs.get(name);
    if (set) {
      set.add(handler);
    } else {
      this._F_obs.set(name, new Set([handler]));
    }
  }

  _say(targetName, name, ctx) {
    const handlers = this._F_obs.get(targetName);
    if (handlers === undefined) return;

    handlers.forEach(it => {
      if (this._isFn(it)) {
        it.call(this, ctx);
        return;
      }

      let method = it[name];
      if (this._isFn(method)) {
        method.call(it, ctx);
      }
    });
  }

  _callR(args, target, method, methodOwner) {
    let t = methodOwner ? this[methodOwner] : this;
    if (t) t = t[method];
    if (t) t.apply(this, args);

    const children = this[target];
    if (!children) return;

    for (let name in children){
      const c = children[name];
      if (c._callR) c._callR(args, target, method, methodOwner);
    }
  }

  _isStr(v) {
    return (typeof v === 'string')
  }

  _isFn(f) {
    return (typeof f === 'function')
  }
}

/**
 * Http Error
 */
class HttpError {

  /**
   * @contructor
   * @param req  request
   * @param resOrErr response or Error
   */
  constructor(req, resOrErr) {
    this.req = req;

    if (typeof resOrErr === 'string') {
      this.res = null;

      this.isTimeout = (resOrErr === 'timeout');
      this.isAborted = (resOrErr === 'abort');
      this.isNetworkError = (resOrErr === 'error');
    } else {
      this.res = resOrErr;

      let code = this.res.status;
      this.isBadRequest   = (code === 400);
      this.isUnauthorized = (code === 401);
      this.isForbidden    = (code === 403);
      this.isNotFound     = (code === 404);
      this.isConflict     = (code === 409);
      this.isServerError  = (code >= 500);
    }
  }
}

/**
 * HTTP Client
 *
 * @class HttpClient
 */
class HttpClient {

  /**
   * Constructor.
   * @param {object} [opts] - options
   * @param {string} [opts.baseURL] - base URL (default empty).
   * @param {object} [opts.headers] - custom headers
   * @param {Promise} [opts.beforeRequest] - async function called before the request
   * @param {Promise} [opts.beforeError] - async function called before throw an error. if return false, stop throwing the error
   */
  constructor(opts = {}) {
    this.baseURL = opts.baseURL || '';
    this.headers = opts.headers || {};
    this.beforeRequest = opts.beforeRequest || (async () => {});
    this.beforeError = opts.beforeError || (async () => true);

    const bodyType = opts.bodyType || '';
    if (bodyType.includes('form')) {
      this.contentType = 'application/x-www-form-urlencoded';
    } else {
      this.contentType = 'application/json;charset=UTF-8';
    }
  }

  /**
   * do GET request.
   * 
   * @param  {String} path - request path
   * @param  {object} [ctx] - context
   * @param  {object} [ctx.query] - request query data
   * @param  {object} [ctx.body] - request body
   * @param  {object} [ctx.headers] - header name and value object
   * @return {Promise} Promise resolves response bodystatus: xhr.status,
   * @type {number} status - status code
   * @type {object} headers - response header name and value object
   * @type {*} body - response body
   */
  get(path, ctx = {}) {
    const { query, body, headers } = ctx;
    return this.exec('GET', path, query, body, headers);
  }

  /**
   * do POST request.
   * 
   * @param  {String} path - request path
   * @param  {object} [ctx] - context
   * @param  {object} [ctx.query] - request query data
   * @param  {object} [ctx.body] - request body
   * @param  {object} [ctx.headers] - header name and value object
   * @return {Promise} Promise resolves response bodystatus: xhr.status,
   * @type {number} status - status code
   * @type {object} headers - response header name and value object
   * @type {*} body - response body
   */
  post(path, ctx = {}) {
    const { query, body, headers } = ctx;
    return this.exec('POST', path, query, body, headers);
  }

  /**
   * do PUT request.
   * 
   * @param  {String} path - request path
   * @param  {object} [ctx] - context
   * @param  {object} [ctx.query] - request query data
   * @param  {object} [ctx.body] - request body
   * @param  {object} [ctx.headers] - header name and value object
   * @return {Promise} Promise resolves response bodystatus: xhr.status,
   * @type {number} status - status code
   * @type {object} headers - response header name and value object
   * @type {*} body - response body
   */
  put(path, ctx = {}) {
    const { query, body, headers } = ctx;
    return this.exec('PUT', path, query, body, headers);
  }

  /**
   * do PATCH request.
   * 
   * @param  {String} path - request path
   * @param  {object} [ctx] - context
   * @param  {object} [ctx.query] - request query data
   * @param  {object} [ctx.body] - request body
   * @param  {object} [ctx.headers] - header name and value object
   * @return {Promise} Promise resolves response bodystatus: xhr.status,
   * @type {number} status - status code
   * @type {object} headers - response header name and value object
   * @type {*} body - response body
   */
  patch(path, ctx = {}) {
    const { query, body, headers } = ctx;
    return this.exec('PATCH', path, query, body, headers);
  }

  /**
   * do DELETE request.
   * 
   * @param  {String} path - request path
   * @param  {object} [ctx] - context
   * @param  {object} [ctx.query] - request query data
   * @param  {object} [ctx.body] - request body
   * @param  {object} [ctx.headers] - header name and value object
   * @return {Promise} Promise resolves response bodystatus: xhr.status,
   * @type {number} status - status code
   * @type {object} headers - response header name and value object
   * @type {*} body - response body
   */
  delete(path, ctx = {}) {
    const { query, body, headers } = ctx;
    return this.exec('DELETE', path, query, body, headers);
  }

  /**
   * execute http request.
   * 
   * @param  {string} method - method
   * @param  {string} path - request path
   * @param  {object} query - request query data
   * @param  {string|object} body - request body
   * @param  {object} headers - header name and value object
   * @return {Promise} Promise
   * @type {number} status - status code
   * @type {object} headers - response header name and value object
   * @type {*} body - response body
   */
  async exec(method, path, query, body, headers = {}) {
    headers = Object.assign({}, this.headers, headers);

    if (!('Content-Type' in headers)) {
      headers['Content-Type'] = this.contentType;
    }

    await this.beforeRequest(path, { query, body, headers });

    const req = { method, path, headers };
    let httpErr;
    try {
      const res = await this._request(method, path, { query, body, headers });
      const { status } = res;
      if (status < 400) {
        return res;
      }

      httpErr = new HttpError(req, res);
    } catch(errType) {
      httpErr = new HttpError(req, errType);
    }

    if (await this.beforeError(httpErr) !== false) {
      throw httpErr;
    }
  }

  _request(method, path, { query, body, headers }) {
    let reqBody;
    if (body) {
      const cttType = headers['Content-Type'];
      if (cttType.match(/\/form-data/)) {
        reqBody = new FormData();
        for (let field in body) {
          reqBody.append(field, body[field]);
        }
        delete headers['Content-Type']; // FormData set it with boundary
      } else if (cttType.match(/\/json/)) {
        reqBody = JSON.stringify(body);
      } else {
        reqBody = this._formatParams(body);
      }
    } else {
      reqBody = undefined;
    }

    let url = path;
    if (this.baseURL && !url.match(/^[a-z]{2,5}:\/\//)) {
      url = this.baseURL + url;
    }
    if (query) url += '?' + this._formatParams(query);

    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url, true);

        for (let name in headers) {
          xhr.setRequestHeader(name, headers[name]);
        }

        xhr.onload = (evt) => {
          let resBody, resCttType = xhr.getResponseHeader('Content-Type');
          if (resCttType === null) {
            resBody = null;
          } else if (resCttType.match(/\/json/)) {
            resBody = JSON.parse(xhr.response);
          } else if (resCttType.match(/\/form/)) {
            resBody = this._fromFormData(xhr.response);
          } else {
            resBody = xhr.response;
          }

          resolve({
            status: xhr.status,
            headers: xhr.getAllResponseHeaders(),
            body: resBody
          });
        };

        xhr.onabort = function(err){ reject('abort'); };
        xhr.onerror = function(err){ reject('error'); };
        xhr.ontimeout = function(err){ reject('timeout'); };

        xhr.send(reqBody);
      });
  }

  _formatParams(params) {
    return new URLSearchParams(params).toString()
  }

  _fromFormData(body) {
    const data = {};
    body.split('&').forEach(item => {
      const [key, val] = item.split('=');
      data[decodeURIComponent(key)] = decodeURIComponent(val);
    });
    return data;
  }
}

/**
 * Item.
 * this can be an element of List.
 * 
 * @memberOf flatout
 */
class Item extends Core {

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
    eachEntry(pairs, ([key, val]) => this._updateField(key, val));
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
        cur.reset(value);
      } else {
        cur.update(value);
      }
    } else {
      this[field] = value;
      this.say('update', { field, newValue: value, oldValue: cur });
    }
  }
}

/**
 * List for plain object or Item.
 *
 * @memberOf flatout
 */
class List extends Item {

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
      index = this._data.indexOf(itemOrIndex); // find item
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
    items.forEach(item => this.add(item, insertIndex));
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
      judge = it => it[predictOrField] === value;
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
    this._data.forEach(cb);
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
    item.listened('*', this);
  }

  /**
   * Remove listening to item
   */
  destroy() {
    this._item.unlistened('*', this);
    this._item = null;
  }
}

/**
 * Binding Item and View
 * to apply the change of item to View
 * @access protected
 */
class ItemBinder extends Binder {
  /**
   * Constructor.
   * 
   * @param {Item} item - target data
   * @param {View} view - target view
   */
  constructor(item, view) {
    super(item);
    this._view = view;
  }

  /**
   * Updating field of view
   */
  update({ field, newValue, oldValue }) {
    this._view.update(field, newValue, oldValue);
  }
}

/**
 * Binding List and ListView
 * to apply the change of colleciton to ListView and its child Views
 * @access protected
 */
class ListBinder extends Binder {
  /**
   * Constructor.
   * 
   * @param {List} list - target data
   * @param {ListView} listView - target view
   */
  constructor(list, listView) {
    super(list);
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
    this._callR(args, 'views', method);
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

    if (this.html) {
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
    this.container.appendChild(el);
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
    delete this.views[viewName];
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
    if (data === undefined || !(data instanceof Object)) return;
    console.log('View#_setDataToUI', this);

    eachEntry(this._data, ([name, val]) => {
      this._setFieldValue(name, val);
    });
  }

  _setFieldValue(name, val) {
    if (name in this.views) {
      this.views[name].data = val;
      return true;
    }

    const el = this.findEl(name);
    if (!el) return false;

    if (el.dataset && el.dataset.type === 'html') {
      el.innerHTML = val;
    } else if ('value' in el) {
      el.value = val;
    } else {
      el.textContent = val;
    }

    return true;
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
    });
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
    });
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
    });

    return emap;
  }
}

/**
* Root view of page
*
* @example
* class DetailPage extends Page {
*   title() {
*     return 'Detail Page'
*   }
*
*   html(data) {
*     return `\
*     <div>
*       <h1>${data.headline}</h1>
*     </div>
*     `
*   }
* }
*/
class Page extends View {
  /**
   * Return document title
   */
  title() {
    return ''
  }

  /** @override */
  destroy() {
    super.destroy();
    this.el.remove();
  }
}

/**** Design memo *********************************************

* Open `http://FQDN/` and Enter in URL bar --> onload
* Input appending `http://FQDN/#!/` and Enter in URL bar --> onhashchange
* Open `http://FQDN/#!/xxxx` in URL bar --> onload
* Reload --> onload
* Click a link with href=`#!/xxxx` --> onhashchange
* Run script `window.location.hash = '#!/xxx';` --> onhashchange
* Back to `#!/xxxx' --> onhashchange
* Forward to `#!/xxxx' --> onhashchange

```
const routeMap = {
  index: HomeView,                  // /
  about: AboutView,                 // /about
  books: {
    index: BookListView,            // /books
    ':bookId': {
      index:   BookView,            // /books/:bookId
      summary: BookSummaryView,     // /books/:bookId/summary
      readers: {
        index: '../',               // redirect to /books/:bookId
        ':readerId': BookReaderView // /books/:bookId/readers/:readerId
      }
    }
  },
  docs: {
    index: DocIndexView,            // /docs
    api:   DocApiView,              // /docs/api
  },
  ':userId': {
    index: UserView,                // /:userId
    timeline: UserTimelineView      // /:userId/timeline
  }
}
```

be converted to

```
const _routeTree = {
  index: HomeView,
  about: AboutView,
  books: {
    index: BookListView,
    _any_: {
      id: 'bookId',
      children: {
        index: BookView,
        summary: BookSummaryView,
        readers: {
          index: '../',
          _any_: {
            view: BookReaderView,
            id:   'readerId'
          }
        }
      }
    }
  },
  docs: {
    index: DocIndexView,
    api: DocApiView
  },
  _any_: {
    id: 'userId',
    children: {
      index: UserView,
      timeline: UserTimelineView
    }
  }
}
```
***********************************************************/

/**
 * Router
 *
 * This subclass must override depart() and go(path)
 *
 * @access private
 * @example
 * const routeMap = {
 *   index: HomeView,                  // /
 *   about: AboutView,                 // /about
 *   books: {
 *     index: BookListView,            // /books/
 *     ':bookId': {
 *       index: BookDetailView,        // /books/:bookId
 *       summary: BookSummaryView,     // /books/:bookId/summary
 *       readers: {
 *         index: '../',   // redirect to /books/:bookId
 *         ':readerId': BookReaderView // /books/:bookId/readers/:readerId
 *       }
 *     },
 *     pages: {
 *       index: PagesView,             // /pages/
 *       faq: FaqView,                 // /pages/faq
 *       policy: PolicyView            // /pages/policy
 *     }
 * };
 *
 * const router = new Router(routeMap);
 */
class Router {
  constructor(routeMap, onMove) {
    this._routeTree = this._parseRoute(routeMap);
    this._lastRoute = null;
    this.onMove = onMove;
  }

  /**
   * Need call `depart` after first page loaded
   *
  depart() {
  } */

  canGo(path) {
    return this.getRoute(path) !== null;
  }

  /**
   * Need call `go` when History mode and anchor tag clicked
   * or moving the other page by a script
   *
   * @param  {String} path path
  go(path) {
  } */

  move(path) {
    this.onMove(this.getRoute(path));
  }

  /**
   * @return {Object} layer
   * @property {Page} view - page view.
   * @property {Object} ctx - context (path ids).
   */
  getRoute(absPath) {
    if (!absPath.startsWith('/')) absPath = '/'+absPath;

    let pt = absPath;
    if (pt === '/') pt += 'index';
    pt = this._chopEndSlash(pt);
    if (pt.endsWith('.html')) pt = pt.substr(0, pt.length - 5);

    const paths = this._parsePath(pt);
    let tree = this._routeTree;

    let idMap = {}, key, route = null;
    while ((key = paths.shift()) !== undefined) {
      let target;
      if (key in tree) {
        target = tree[key];
      } else if ('_any_' in tree) {
        idMap[tree._any_.id] = key;
        tree = tree._any_.children;
        if (paths.length > 0) continue;
        target = tree.index;
      } else {
        alert(`${pt} page isn't defined`);
        throw '/';
      }

      if (this._isStr(target)) {
        const redirectPath = this._resolve(absPath, target);
        window.history.replaceState(null, null, redirectPath);
        return this.getRoute(redirectPath);
      } else if (target.prototype instanceof Page) {
        route = { view: target, ctx: idMap };
      } else {
        tree = target;        
        if (paths.length === 0) paths.unshift('index');
      }
    }

    if (route) return route;

    alert(`${path} page not found`);
    throw '/';
  }

  _parsePath(path) {
    const paths = path.split('/');
    paths.shift();
    return paths;
  }

  _parseRoute(map) {
    const tree = {};

    eachEntry(map, ([key, item]) => {
      const isViewOrStr = (item.prototype instanceof Page) || this._isStr(item);

      if (key.startsWith(':')) {
        const leaf = tree._any_ = { id: key.substr(1) }; // strip prefix :
        leaf.children = isViewOrStr ? { index: item } : this._parseRoute(item);
      } else {
        tree[key] = isViewOrStr ? item : this._parseRoute(item);
      }
    });

    return tree;
  }

  _resolve(src, dest) {
    if (dest.startsWith('/')) return dest;

    const parts = src.split('/');

    let md;
    while (md = dest.match(/^\.\.\/?(.*)$/)) {
      parts.pop();
      dest = md[1];
    }

    return parts.join('/') + dest;
  }

  _chopEndSlash(pt) {
    return pt.endsWith('/') ? pt.substr(0, pt.length - 1) : pt;
  }

  _isStr(v) {
    return typeof v === 'string'
  }
}

/**
 * @access private
 */
class HistoryRouter extends Router {
  constructor(routeMap, onMove, rootPath) {
    super(routeMap, onMove);

    let pt = rootPath;
    if (!pt) {
      let base = document.querySelector('base');
      if (base) {
        const { pathname } = new URL(base.href);
        pt = this._chopEndSlash(pathname);
      }
    }
    this.basePath = pt || '';
  }

  depart() {
    document.addEventListener('click', e => {
      this._captureClick(e);
    }, true);

    const doMove = pt => {
      try {
        this.move(pt);
      } catch(e) {
        if (this._isStr(e)) {
          window.location.href = this.basePath + e;
        } else {
          console.error(e);
        }          
      }
    };

    window.onpopstate = e => {
      doMove(e.state ? e.state.path : '/');
    };

    let path = window.location.pathname.substr(this.basePath.length);
    if (path.length > 1 && path.endsWith('/')) {
      // Force strip last with / from path
      path = path.substr(0, path.length - 1);
      window.history.replaceState(null, null, path);
    }

    doMove(path);
  }

  go(path) {
    const h = window.history;
    if (h && h.pushState) {
      h.pushState({ path }, null, this.basePath + path);
      this.move(path);
    }
  }

  _captureClick(e) {
    const nxt = document.activeElement;
    if (!nxt || nxt.tagName !== 'A') return;
    if (nxt.target === '_top') return;

    if (nxt.href.startsWith(window.location.origin + this.basePath)) {
      e.preventDefault();

      try {
        this.go(nxt.pathname.substr(this.basePath.length));
      } catch(e) {
        if (this._isStr(e)) {
          this.go(e);
        } else {
          console.error(e);
        }
      }
    }
  }
}

/**
 * @access private
 */
class HashRouter extends Router {
  constructor(routeMap, onMove, pathHead = '#!') {
    super(routeMap, onMove);
    this.head = pathHead;
  }

  get curPath() {
    return window.location.hash.substr(this.head.length)
  }

  depart() {
    const doMove = pt => {
      try {
        this.move(pt);
      } catch(e) {
        if (this._isStr(e)) {
          window.location.hash = this.head + e;
        } else {
          console.error(e);
        }
      }
    };

    window.onhashchange = e => {
      doMove(this.curPath || '/');
    };

    doMove(this.curPath);
  }

  go(path) {
    window.location.hash = this.head + path;
  }
}

/**
 * Application.
 *
 * @memberOf flatout
 */
class App {
  /* Do not call */
  constructor() {}

  /**
   * Activate application
   *
   * @param  {Class<View>} rootViewClass - root view class.
   * @param  {Object} routeMap - routing map.
   * @param  {Object} [opts]          - options.
   * @param  {Object} [opts.mode]     - HISTORY or HASH
   * @param  {Object} [opts.rootPath] - history root path.
   * @param  {Object} [opts.pathHead] - hash path prefix.
   */
  activate(rootViewClass, routeMap, opts = {}) {
    /**
     * Root area.
     * @type {View}
     */
    this._rootArea = new rootViewClass();

    /**
     * Page area replaced if path changed.
     * @type {Page}
     */
    this._curPage = null;

    const onMove = layer => { this._onMove(layer); };
    this._router = opts.mode === 'HISTORY'
      ? new HistoryRouter(routeMap, onMove, opts.rootPath)
      : new HashRouter(routeMap, onMove, opts.pathHead);

    const loadCb = e => { this._router.depart(); };
    if (document.readyState !== 'loading') loadCb();
    else document.addEventListener('DOMContentLoaded', loadCb, false);
  }

  /**
   * Go a page.
   *
   * @param  {string} path - URL path
   * @param  {Object} ctx  - context
   * @return {boolean} always false.
   */
  go(path, ctx) {
    this._preCtx = ctx;
    this._router.go(path);
    return false;
  }

  /**
   * Back page.
   *
   * @return {boolean} - always false.
   */
  back() {
    window.history.back();
    return false;
  }

  _onMove({ view, ctx }) {
    if (this._preCtx) {
      // Merge ctx by go to layer.ctx that contains idMap
      ctx = Object.assign(ctx || {}, this._preCtx);
      this._preCtx = null;
    }
    this._replaceContent(view, ctx);
    this._updateTitle();
  }

  /**
   * Replace layer.
   *
   * @param {Class<Page>} view - new page class.
   * @param {Object} ctx - passing context.
   */
  _replaceContent(view, ctx) {
    const oldPage = this._curPage;
    if (oldPage) {
      oldPage.destroy();
    }

    const baseCtx = Object.assign({}, this._rootArea.context);
    this._curPage = new view({
      parent: this._rootArea,
      context: Object.assign(baseCtx, ctx)
    });
  }

  /**
   * Update page title of browser
   */
  _updateTitle() {
    let ttl = '';
    if (this._curPage) {
      ttl = this._curPage.title();
    }
    document.title = this._rootArea.title(ttl);
  }
}

var app = new App();

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
   * @param {Element} [root] - root node
   * @param {Class} [itemView] - item view class
   * @param {Object} [props] - properties
   */
  constructor(/*root, itemView, props*/) {
    let root, props = {};
    for (let arg of arguments) {
      if (arg instanceof Node || typeof arg === 'string') {
        root = arg;
      } else if (arg && arg.constructor === Object) {
        Object.assign(props, arg);
      } else if (arg !== undefined) {
        props._F_tmpl = arg; // itemView
      }
    }
    super(root, props);
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
    this.addItemEl(this.container, view.el);
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
    this.insertItemEl(this.container, view.el, this._childElAt(index));
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
    const el = this._childElAt(index);
    this._removeItemByEl(el);
  }

  /**
   * Remove item with view
   *
   * @param {view} view - an view of removing item
   */
  removeItemByView(view) {
    this._removeItemByEl(view.el);
  }

  /**
   * If you change adding item effect, override this method.
   *
   * @protected
   * @param {Element} listEl parent element for List
   * @param {Element} itemEl added element
   */
  addItemEl(listEl, itemEl) {
    listEl.appendChild(itemEl);
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
    listEl.insertBefore(newEl, nextEl);
  }

  /**
   * If you change removing item effect, override this method.
   *
   * @protected
   * @param {Element} listEl - parent element for List
   * @param {Element} itemEl - removed element
   */
  removeItemEl(listEl, itemEl) {
    listEl.removeChild(itemEl);
  }

  /**
   * Return child element at position.
   *
   * @param {number} index - item position.
   * @return {Element} target element
   */
  _childElAt(index) {
    return this.container.children[index];
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
    const vws = this.views;
    vws[LFID].unload();
    delete vws[LFID];
    this.removeItemEl(this.container, el);
  }

  /** @override */
  _bindData() {
    const data = this._data;
    if (data instanceof List) {
      this._F_binders.push(new ListBinder(data, this));
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

/**
* A FormView is data fields to bind input, select or textarea by theirs names.
*
* @example
* // Create a FormView bound to loginForm
* views.form = new FormView('loginForm');
* 
* evts.form_submit = function(sender, e) {
*   var body = this.data;
*   http.post('/login', { body });
* }
* @example {@lang xml}
* <form id="loginForm">
*   <input type="text" name="email">
*   <input type="password" name="password">
*   <button type="submit">Sign in</button>
* </form>
*/
class FormView extends View {

  /**
   * @override
   */
  get data() {
    return this._assignFromFields(this._data);
  }

  set data(value) {
    super.data = value;
  }

  /**
   * Get field value as the type.
   *
   * @param {string} field - target field
   * @return {Any} the value
   */
  getValueOf(field) {
    const el = this.findEl(field);
    if (el) {
      return this._valueAsType(el);
    }

    const vw = this.views[field];
    if (vw) {
      return vw.data;
    }
  }

  /**
   * also returns form element by name.
   * @override
   */
  findEl(id) {
    return this.el[id] || super.findEl(id);
  }

  _assignFromFields(data = {}) {
    const result = Object.assign({}, data);

    // FormData cooks radio buttons and no name inputs
    for (let [name, _] of new FormData(this.el)) {
      result[name] = this._valueAsType(this.el[name]);
    }

    for (let fel of this.el.querySelectorAll('[data-id]')) {
      const val = this._valueAsType(fel);
      if (val !== undefined) {
        result[fel.dataset.id] = val;
      }
    }

    eachEntry(this.views, ([name, view]) => {
      result[name] = view.data;
    });

    return result;
  }

  _valueAsType(el) {
    const ds = el.dataset || {};
    const type = ds.type || 'text';
    let val = el.value;
    if (type === 'number') {
      val = Number(val);
    } else if (type.startsWith('bool')) {
      val = Boolean(val);
    }
    return val;
  }

  _setFieldValue(name, val) {
    const input = this.el[name];
    if (input) {
      input.value = val;
      return;
    }
    super._setFieldValue(name, val);
  }
}

export { app as App, Core, FormView, HttpClient, HttpError, Item, List, ListView, Page, View };
