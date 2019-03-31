'use strict'

import { eachEntry } from '../core/util.js'

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
      dp[key] = { value }
    })
    Object.defineProperties(this, dp)
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
   * Listen a message
   *
   * @param {string|Object} nameOrObj - message name, '*' specify any listener.
   * @param {Function} handler - handler called on message received or target object.
   * @example
   * core.listen('*', function(){});
   * core.listen('evtName1', function(){});
   * core.listen({ evtName2: function(){}, evtName3: function(){} })
   */
  listen(nameOrObj, handler) {
    if (handler) {
      this._listen(nameOrObj, handler);
    } else {
      eachEntry(nameOrObj, ([name, handler]) => this._listen(name, handler));
    }
  }

  /**
   * Unlisten a message
   *
   * @param {string} name - message name, '*' specify any listener.
   * @param {Function|object} handler - handler registered or target registered.
   */
  unlisten(name, handler) {
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

  _listen(name, handler) {
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

export default Core
