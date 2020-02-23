'use strict'

import View from './view.js'

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
export default class Page extends View {
  constructor(params) {
    super(params)
    /**
     * Whether having initial data or not
     * @member {boolean}
     */
    this.hasInitData = false;
  }

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
