'use strict'

import { HistoryRouter, HashRouter } from '../app/router.js'

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

    const onMove = layer => { this._onMove(layer) };
    this._router = opts.mode === 'HISTORY'
      ? new HistoryRouter(routeMap, onMove, opts.rootPath)
      : new HashRouter(routeMap, onMove, opts.pathHead);

    window.onload = e => { this._router.depart() }
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

    const baseCtx = Object.assign({}, this._rootArea.context)
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
      ttl = this._curPage.title()
    }
    document.title = this._rootArea.title(ttl);
  }
}

export default new App();
