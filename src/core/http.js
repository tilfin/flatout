'use strict'

/**
 * Http Error
 */
export class HttpError {

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
export class HttpClient {

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
    if (!('Content-Type' in headers)) {
      headers['Content-Type'] = this.contentType;
    }

    await this.beforeRequest(path, { query, body, headers })

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
    if (this.baseURL && !url.match(/^[a-z]{0,4}\:\/\//)) {
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
        }

        xhr.onabort = function(err){ reject('abort') };
        xhr.onerror = function(err){ reject('error') };
        xhr.ontimeout = function(err){ reject('timeout') };

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
