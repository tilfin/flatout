'use strict'

import { eachEntry } from '../core/util.js'
import View from './view.js'

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
    const result = Object.assign({}, data)

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
    if (type.startsWith('date') || el.type === 'datetime-local') {
      val = new Date(val)
    } else if (type === 'number') {
      val = Number(val)
    } else if (type.startsWith('bool')) {
      val = Boolean(val)
    } 
    return val;
  }

  _setFieldValue(name, val) {
    const input = this.el[name];
    if (input) {
      if (input.type === 'datetime-local') {
        val = this.formatLocalDateTime(new Date(val))
      }
      input.value = val;
      return;
    }
    super._setFieldValue(name, val);
  }

  formatLocalDateTime(date) {
    return [date.getFullYear(), '-',
      ('0' + (date.getMonth() + 1)).slice(-2), '-',
      ('0' + date.getDate()).slice(-2), 'T',
      ('0' + date.getHours()).slice(-2), ':',
      ('0' + date.getMinutes()).slice(-2)
    ].join('')
  }
}

export default FormView
