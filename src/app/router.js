'use strict'

import { eachEntry } from '../core/util.js'
import Page from '../view/page.js'

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

    alert(`${absPath} page not found`);
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
export class HistoryRouter extends Router {
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
          console.error(e)
        }          
      }
    }

    window.onpopstate = e => {
      doMove(e.state ? e.state.path : '/')
    }

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
          console.error(e)
        }
      }
    }
  }
}

/**
 * @access private
 */
export class HashRouter extends Router {
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
          console.error(e)
        }
      }
    }

    window.onhashchange = e => {
      doMove(this.curPath || '/')
    }

    doMove(this.curPath);
  }

  go(path) {
    window.location.hash = this.head + path;
  }
}
