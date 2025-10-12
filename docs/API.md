## Modules

<dl>
<dt><a href="#module_view/page">view/page</a></dt>
<dd><p>Module: view/page</p>
</dd>
</dl>

## Classes

<dl>
<dt><a href="#Core">Core</a></dt>
<dd><p>Core</p>
</dd>
<dt><a href="#HttpError">HttpError</a></dt>
<dd><p>Http Error</p>
</dd>
<dt><a href="#HttpClient">HttpClient</a></dt>
<dd></dd>
<dt><a href="#ItemBinder">ItemBinder</a></dt>
<dd><p>Binding Item and View
to apply the change of item to View</p>
</dd>
<dt><a href="#ListBinder">ListBinder</a></dt>
<dd><p>Binding List and ListView
to apply the change of colleciton to ListView and its child Views</p>
</dd>
<dt><a href="#FormView">FormView</a></dt>
<dd><p>A FormView is data fields to bind input, select or textarea by theirs names.</p>
</dd>
<dt><a href="#ListView">ListView</a></dt>
<dd><p>View for the collection of items.</p>
</dd>
<dt><a href="#View">View</a></dt>
<dd><p>View</p>
</dd>
</dl>

<a name="module_view/page"></a>

## view/page
Module: view/page


* [view/page](#module_view/page)
    * [module.exports](#exp_module_view/page--module.exports) ⏏
        * [new module.exports()](#new_module_view/page--module.exports_new)
        * [.hasInitData](#module_view/page--module.exports+hasInitData) : <code>boolean</code>
        * [.title()](#module_view/page--module.exports+title)
        * [.destroy()](#module_view/page--module.exports+destroy)

<a name="exp_module_view/page--module.exports"></a>

### module.exports ⏏
Root view of page

**Kind**: Exported class  
<a name="new_module_view/page--module.exports_new"></a>

#### new module.exports()
**Example**  
```js
class DetailPage extends Page {
  title() {
    return 'Detail Page'
  }

  html(data) {
    return `\
    <div>
      <h1>${data.headline}</h1>
    </div>
    `
  }
}
```
<a name="module_view/page--module.exports+hasInitData"></a>

#### module.exports.hasInitData : <code>boolean</code>
Whether having initial data or not

**Kind**: instance property of [<code>module.exports</code>](#exp_module_view/page--module.exports)  
<a name="module_view/page--module.exports+title"></a>

#### module.exports.title()
Return document title

**Kind**: instance method of [<code>module.exports</code>](#exp_module_view/page--module.exports)  
<a name="module_view/page--module.exports+destroy"></a>

#### module.exports.destroy()
**Kind**: instance method of [<code>module.exports</code>](#exp_module_view/page--module.exports)  
<a name="Core"></a>

## Core
Core

**Kind**: global class  

* [Core](#Core)
    * [new Core()](#new_Core_new)
    * [.listened(nameOrObj, handler)](#Core+listened)
    * [.unlistened(name, handler)](#Core+unlistened)
    * [.unescapeHtml(escaped)](#Core+unescapeHtml) ⇒ <code>String</code>
    * [.say(name, ctx)](#Core+say)

<a name="new_Core_new"></a>

### new Core()
Create a Core.

<a name="Core+listened"></a>

### core.listened(nameOrObj, handler)
Add handler or listener for saying message

**Kind**: instance method of [<code>Core</code>](#Core)  

| Param | Type | Description |
| --- | --- | --- |
| nameOrObj | <code>string</code> \| <code>Object</code> | message name, '*' specify any listener. |
| handler | <code>function</code> | handler called on message received or listener. |

**Example**  
```js
core.listened('*', function(){});
core.listened('evtName1', function(){});
core.listened({ evtName2: function(){}, evtName3: function(){} })
```
<a name="Core+unlistened"></a>

### core.unlistened(name, handler)
Remove handler or listener

**Kind**: instance method of [<code>Core</code>](#Core)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | message name, '*' specify any listener. |
| handler | <code>function</code> | handler registered or listener registered. all registered handler will be removed if not specified. |

<a name="Core+unescapeHtml"></a>

### core.unescapeHtml(escaped) ⇒ <code>String</code>
Unescape HTML

**Kind**: instance method of [<code>Core</code>](#Core)  
**Returns**: <code>String</code> - raw HTML string  

| Param | Type | Description |
| --- | --- | --- |
| escaped | <code>String</code> | HTML string |

<a name="Core+say"></a>

### core.say(name, ctx)
Cast a message to the listeners

**Kind**: instance method of [<code>Core</code>](#Core)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | message name |
| ctx | <code>\*</code> | passing value |

<a name="HttpClient"></a>

## HttpClient
**Kind**: global class  

* [HttpClient](#HttpClient)
    * [new HttpClient()](#new_HttpClient_new)
    * [.HttpClient](#HttpClient+HttpClient)
        * [new exports.HttpClient([opts])](#new_HttpClient+HttpClient_new)
    * [.beforeRequest(path, [ctx])](#HttpClient+beforeRequest)
    * [.beforeError(err)](#HttpClient+beforeError) ⇒ <code>Promise.&lt;boolean&gt;</code>
    * [.get(path, [ctx])](#HttpClient+get) ⇒ <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code>
    * [.post(path, [ctx])](#HttpClient+post) ⇒ <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code>
    * [.put(path, [ctx])](#HttpClient+put) ⇒ <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code>
    * [.patch(path, [ctx])](#HttpClient+patch) ⇒ <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code>
    * [.delete(path, [ctx])](#HttpClient+delete) ⇒ <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code>
    * [.exec(method, path, query, body, headers)](#HttpClient+exec) ⇒ <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code>

<a name="new_HttpClient_new"></a>

### new HttpClient()
HTTP Client

<a name="HttpClient+HttpClient"></a>

### httpClient.HttpClient
**Kind**: instance class of [<code>HttpClient</code>](#HttpClient)  
<a name="new_HttpClient+HttpClient_new"></a>

#### new exports.HttpClient([opts])
Constructor.


| Param | Type | Description |
| --- | --- | --- |
| [opts] | <code>object</code> | options |
| [opts.baseURL] | <code>string</code> | base URL (default empty). |
| [opts.headers] | <code>object</code> | custom headers |
| [opts.bodyType] | <code>string</code> | post/put type `form` | `json` |

<a name="HttpClient+beforeRequest"></a>

### httpClient.beforeRequest(path, [ctx])
hook async function called before the request.

**Kind**: instance method of [<code>HttpClient</code>](#HttpClient)  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>String</code> | request path |
| [ctx] | <code>object</code> | context |
| [ctx.query] | <code>object</code> | request query data |
| [ctx.body] | <code>object</code> | request body |
| [ctx.headers] | <code>object</code> | header name and value object |

<a name="HttpClient+beforeError"></a>

### httpClient.beforeError(err) ⇒ <code>Promise.&lt;boolean&gt;</code>
hook async function called before throw an error.

**Kind**: instance method of [<code>HttpClient</code>](#HttpClient)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - - if return false, stop throwing the error.  

| Param | Type | Description |
| --- | --- | --- |
| err | [<code>HttpError</code>](#HttpError) | request path |

<a name="HttpClient+get"></a>

### httpClient.get(path, [ctx]) ⇒ <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code>
do GET request.

**Kind**: instance method of [<code>HttpClient</code>](#HttpClient)  
**Returns**: <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code> - Promise resolving to an object with response details  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>String</code> | request path |
| [ctx] | <code>object</code> | context |
| [ctx.query] | <code>object</code> | request query data |
| [ctx.body] | <code>object</code> | request body |
| [ctx.headers] | <code>object</code> | header name and value object |

<a name="HttpClient+post"></a>

### httpClient.post(path, [ctx]) ⇒ <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code>
do POST request.

**Kind**: instance method of [<code>HttpClient</code>](#HttpClient)  
**Returns**: <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code> - Promise resolving to an object with response details  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>String</code> | request path |
| [ctx] | <code>object</code> | context |
| [ctx.query] | <code>object</code> | request query data |
| [ctx.body] | <code>object</code> | request body |
| [ctx.headers] | <code>object</code> | header name and value object |

<a name="HttpClient+put"></a>

### httpClient.put(path, [ctx]) ⇒ <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code>
do PUT request.

**Kind**: instance method of [<code>HttpClient</code>](#HttpClient)  
**Returns**: <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code> - Promise resolving to an object with response details  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>String</code> | request path |
| [ctx] | <code>object</code> | context |
| [ctx.query] | <code>object</code> | request query data |
| [ctx.body] | <code>object</code> | request body |
| [ctx.headers] | <code>object</code> | header name and value object |

<a name="HttpClient+patch"></a>

### httpClient.patch(path, [ctx]) ⇒ <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code>
do PATCH request.

**Kind**: instance method of [<code>HttpClient</code>](#HttpClient)  
**Returns**: <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code> - Promise resolving to an object with response details  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>String</code> | request path |
| [ctx] | <code>object</code> | context |
| [ctx.query] | <code>object</code> | request query data |
| [ctx.body] | <code>object</code> | request body |
| [ctx.headers] | <code>object</code> | header name and value object |

<a name="HttpClient+delete"></a>

### httpClient.delete(path, [ctx]) ⇒ <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code>
do DELETE request.

**Kind**: instance method of [<code>HttpClient</code>](#HttpClient)  
**Returns**: <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code> - Promise resolving to an object with response details  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>String</code> | request path |
| [ctx] | <code>object</code> | context |
| [ctx.query] | <code>object</code> | request query data |
| [ctx.body] | <code>object</code> | request body |
| [ctx.headers] | <code>object</code> | header name and value object |

<a name="HttpClient+exec"></a>

### httpClient.exec(method, path, query, body, headers) ⇒ <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code>
execute http request.

**Kind**: instance method of [<code>HttpClient</code>](#HttpClient)  
**Returns**: <code>Promise.&lt;{status:number, headers:object, body: \*}&gt;</code> - Promise resolving to an object with response details  

| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | method |
| path | <code>string</code> | request path |
| query | <code>object</code> | request query data |
| body | <code>string</code> \| <code>object</code> | request body |
| headers | <code>object</code> | header name and value object |

<a name="FormView"></a>

## FormView
A FormView is data fields to bind input, select or textarea by theirs names.

**Kind**: global class  

* [FormView](#FormView)
    * [new FormView()](#new_FormView_new)
    * [.data](#FormView+data)
    * [.getValueOf(field)](#FormView+getValueOf) ⇒ <code>Any</code>
    * [.findEl()](#FormView+findEl)

<a name="new_FormView_new"></a>

### new FormView()
**Example**  
```js
// Create a FormView bound to loginForm
views.form = new FormView('loginForm');

evts.form_submit = function(sender, e) {
  var body = this.data;
  http.post('/login', { body });
}
```
**Example**  
```xml
{}
<form id="loginForm">
  <input type="text" name="email">
  <input type="password" name="password">
  <button type="submit">Sign in</button>
</form>
```
<a name="FormView+data"></a>

### formView.data
**Kind**: instance property of [<code>FormView</code>](#FormView)  
<a name="FormView+getValueOf"></a>

### formView.getValueOf(field) ⇒ <code>Any</code>
Get field value as the type.

**Kind**: instance method of [<code>FormView</code>](#FormView)  
**Returns**: <code>Any</code> - the value  

| Param | Type | Description |
| --- | --- | --- |
| field | <code>string</code> | target field |

<a name="FormView+findEl"></a>

### formView.findEl()
also returns form element by name.

**Kind**: instance method of [<code>FormView</code>](#FormView)  
<a name="ListView"></a>

## ListView
View for the collection of items.

**Kind**: global class  

* [ListView](#ListView)
    * [new ListView()](#new_ListView_new)
    * [._privates()](#ListView+_privates)
    * [.itemViewClass(item)](#ListView+itemViewClass) ⇒ [<code>Class.&lt;View&gt;</code>](#View)
    * [.addItem(item)](#ListView+addItem)
    * [.insertItem(item, index)](#ListView+insertItem)
    * [.updateItem(item, index)](#ListView+updateItem)
    * [.removeItem(item, index)](#ListView+removeItem)
    * [.removeItemByView(view)](#ListView+removeItemByView)
    * [.addItemEl(listEl, itemEl)](#ListView+addItemEl)
    * [.insertItemEl(listEl, newEl, nextEl)](#ListView+insertItemEl)
    * [.removeItemEl(listEl, itemEl)](#ListView+removeItemEl)
    * [._childElAt(index)](#ListView+_childElAt) ⇒ <code>Element</code>
    * [._removeItemByEl(el)](#ListView+_removeItemByEl)
    * [._bindData()](#ListView+_bindData)
    * [._setDataToUI()](#ListView+_setDataToUI)

<a name="new_ListView_new"></a>

### new ListView()
**Example**  
```js
class ListItemView extends View {
  html(data) {
    return `<li>${data.title}</li>`;
  }
}

let instanceView = new ListView(Node, ListItemView,
          {
            data: [
              { title: 'foo' },
              { ttile: 'bar' }
            ]
          });
```
<a name="ListView+_privates"></a>

### listView.\_privates()
**Kind**: instance method of [<code>ListView</code>](#ListView)  
<a name="ListView+itemViewClass"></a>

### listView.itemViewClass(item) ⇒ [<code>Class.&lt;View&gt;</code>](#View)
If you dynamically change creating item view according to the item, override this method.

**Kind**: instance method of [<code>ListView</code>](#ListView)  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>object</code> | an item |

<a name="ListView+addItem"></a>

### listView.addItem(item)
Add an item to list

**Kind**: instance method of [<code>ListView</code>](#ListView)  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>object</code> | an item |

<a name="ListView+insertItem"></a>

### listView.insertItem(item, index)
Insert an item to list at index

**Kind**: instance method of [<code>ListView</code>](#ListView)  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>object</code> | an item |
| index | <code>number</code> | target position |

<a name="ListView+updateItem"></a>

### listView.updateItem(item, index)
Update an item at index

**Kind**: instance method of [<code>ListView</code>](#ListView)  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>object</code> | an item |
| index | <code>number</code> | target position |

<a name="ListView+removeItem"></a>

### listView.removeItem(item, index)
Remove item from list

**Kind**: instance method of [<code>ListView</code>](#ListView)  

| Param | Type | Description |
| --- | --- | --- |
| item | <code>object</code> | an item |
| index | <code>number</code> | target position |

<a name="ListView+removeItemByView"></a>

### listView.removeItemByView(view)
Remove item with view

**Kind**: instance method of [<code>ListView</code>](#ListView)  

| Param | Type | Description |
| --- | --- | --- |
| view | <code>view</code> | an view of removing item |

<a name="ListView+addItemEl"></a>

### listView.addItemEl(listEl, itemEl)
If you change adding item effect, override this method.

**Kind**: instance method of [<code>ListView</code>](#ListView)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| listEl | <code>Element</code> | parent element for List |
| itemEl | <code>Element</code> | added element |

<a name="ListView+insertItemEl"></a>

### listView.insertItemEl(listEl, newEl, nextEl)
If you change inserting item effect, override this method.

**Kind**: instance method of [<code>ListView</code>](#ListView)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| listEl | <code>Element</code> | parent element for List |
| newEl | <code>Element</code> | an element for new item for List |
| nextEl | <code>Element</code> | next element will be next one for newEl |

<a name="ListView+removeItemEl"></a>

### listView.removeItemEl(listEl, itemEl)
If you change removing item effect, override this method.

**Kind**: instance method of [<code>ListView</code>](#ListView)  
**Access**: protected  

| Param | Type | Description |
| --- | --- | --- |
| listEl | <code>Element</code> | parent element for List |
| itemEl | <code>Element</code> | removed element |

<a name="ListView+_childElAt"></a>

### listView.\_childElAt(index) ⇒ <code>Element</code>
Return child element at position.

**Kind**: instance method of [<code>ListView</code>](#ListView)  
**Returns**: <code>Element</code> - target element  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | item position. |

<a name="ListView+_removeItemByEl"></a>

### listView.\_removeItemByEl(el)
Remove item from list by element

**Kind**: instance method of [<code>ListView</code>](#ListView)  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>element</code> | removed element |

<a name="ListView+_bindData"></a>

### listView.\_bindData()
**Kind**: instance method of [<code>ListView</code>](#ListView)  
<a name="ListView+_setDataToUI"></a>

### listView.\_setDataToUI()
**Kind**: instance method of [<code>ListView</code>](#ListView)  
<a name="View"></a>

## View
View

**Kind**: global class  

* [View](#View)
    * [new View([props])](#new_View_new)
    * [.el](#View+el) : <code>Node</code>
    * [.views](#View+views) : <code>object</code>
    * [.data](#View+data)
    * [._privates()](#View+_privates)
    * [.prepareData(defaults)](#View+prepareData) ⇒ <code>object</code> \| <code>Item</code>
    * [.load(views)](#View+load)
    * [.handle(evts)](#View+handle)
    * [.completed()](#View+completed)
    * [.unload()](#View+unload)
    * [.broadcast(method, args)](#View+broadcast)
    * [._build()](#View+_build)
    * [._setRootNode()](#View+_setRootNode)
    * [.findEl(id)](#View+findEl) ⇒ <code>Element</code>
    * [.appendEl(el)](#View+appendEl)
    * [.set(name, view)](#View+set)
    * [.fire(name, ctx)](#View+fire)
    * [.destroy()](#View+destroy)
    * [.update(name, newValue, oldValue)](#View+update) ⇒ <code>boolean</code>
    * [._setDataToUI()](#View+_setDataToUI)
    * [._setEvts(el, hmap)](#View+_setEvts)
    * [._trapEvt(root, el, type, handler)](#View+_trapEvt)

<a name="new_View_new"></a>

### new View([props])
Create a View.


| Param | Type | Description |
| --- | --- | --- |
| [props] | <code>object</code> | Properties |
| [props.rootEl] | <code>string</code> \| <code>Element</code> | root element ID or root node |
| [props.parent] | [<code>Class.&lt;View&gt;</code>](#View) | parent view this belongs to |
| [props.contentEl] | <code>string</code> \| <code>Element</code> | parent element of child views (specified by data-id or id value). |

<a name="View+el"></a>

### view.el : <code>Node</code>
Root element

**Kind**: instance property of [<code>View</code>](#View)  
<a name="View+views"></a>

### view.views : <code>object</code>
Subview children of the view

**Kind**: instance property of [<code>View</code>](#View)  
<a name="View+data"></a>

### view.data
data to elements text or value, innerHTML of elements

**Kind**: instance property of [<code>View</code>](#View)  
**Properties**

| Name | Type |
| --- | --- |
| data | <code>object</code> | 

**Example**  
```js
view.data = { name: 'Mike', inputAge: { value: 24 }, message: { html: "<p>Hello!</p>" } };
```
<a name="View+_privates"></a>

### view.\_privates()
**Kind**: instance method of [<code>View</code>](#View)  
<a name="View+prepareData"></a>

### view.prepareData(defaults) ⇒ <code>object</code> \| <code>Item</code>
Prepare data

**Kind**: instance method of [<code>View</code>](#View)  
**Returns**: <code>object</code> \| <code>Item</code> - modified data or item.  

| Param | Type | Description |
| --- | --- | --- |
| defaults | <code>object</code> | default data. |

<a name="View+load"></a>

### view.load(views)
For implement creating subviews and setting listener of events.

**Kind**: instance method of [<code>View</code>](#View)  

| Param | Type | Description |
| --- | --- | --- |
| views | <code>object</code> | added subview target (ex. views.list = new ListView(..)) |

<a name="View+handle"></a>

### view.handle(evts)
Ssetting listener of events.

**Kind**: instance method of [<code>View</code>](#View)  

| Param | Type | Description |
| --- | --- | --- |
| evts | <code>object</code> | added listener target (ex. evts.subview_event) |

<a name="View+completed"></a>

### view.completed()
For implement after loading completed

**Kind**: instance method of [<code>View</code>](#View)  
<a name="View+unload"></a>

### view.unload()
For implement unloading subviews

**Kind**: instance method of [<code>View</code>](#View)  
<a name="View+broadcast"></a>

### view.broadcast(method, args)
Cast a message to all children of view

**Kind**: instance method of [<code>View</code>](#View)  

| Param | Type | Description |
| --- | --- | --- |
| method | <code>string</code> | method name |
| args | <code>Array</code> | arguments |

<a name="View+_build"></a>

### view.\_build()
_loaded resolve after all done

**Kind**: instance method of [<code>View</code>](#View)  
<a name="View+_setRootNode"></a>

### view.\_setRootNode()
Set root node element to this.el

**Kind**: instance method of [<code>View</code>](#View)  
<a name="View+findEl"></a>

### view.findEl(id) ⇒ <code>Element</code>
Find an element that has specified data-id else call getElementById

**Kind**: instance method of [<code>View</code>](#View)  

| Param | Description |
| --- | --- |
| id | data-id value |

**Example**  
```js
view.findEl('elementDataId');
```
<a name="View+appendEl"></a>

### view.appendEl(el)
Append child element

**Kind**: instance method of [<code>View</code>](#View)  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | child element |

<a name="View+set"></a>

### view.set(name, view)
Set child view as name after load

**Kind**: instance method of [<code>View</code>](#View)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | view name |
| view | [<code>View</code>](#View) | child view. remove if null |

**Example**  
```js
parent.set('name', view);
```
<a name="View+fire"></a>

### view.fire(name, ctx)
Fire event

**Kind**: instance method of [<code>View</code>](#View)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | event name |
| ctx | <code>object</code> | event context |

**Example**  
```js
view.fire('move', { newPosition: 1 });
```
<a name="View+destroy"></a>

### view.destroy()
Destroy all chidren, unload, and destroy binder, teardown events

**Kind**: instance method of [<code>View</code>](#View)  
<a name="View+update"></a>

### view.update(name, newValue, oldValue) ⇒ <code>boolean</code>
Called when the binding data is updated.

**Kind**: instance method of [<code>View</code>](#View)  
**Returns**: <code>boolean</code> - true if setting field value succeeded  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | field name |
| newValue | <code>\*</code> | new data value |
| oldValue | <code>\*</code> | old data value |

<a name="View+_setDataToUI"></a>

### view.\_setDataToUI()
Set data to subviews or elements in the view.

**Kind**: instance method of [<code>View</code>](#View)  
<a name="View+_setEvts"></a>

### view.\_setEvts(el, hmap)
Bind targets with event handler set.

**Kind**: instance method of [<code>View</code>](#View)  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | event raiser. |
| hmap | <code>object</code> | handler map. Object<type, value> |

<a name="View+_trapEvt"></a>

### view.\_trapEvt(root, el, type, handler)
Bind target event with handler.

**Kind**: instance method of [<code>View</code>](#View)  

| Param | Type | Description |
| --- | --- | --- |
| root | [<code>View</code>](#View) | caller |
| el | <code>Element</code> | event raiser |
| type | <code>string</code> | event type |
| handler | <code>function</code> | callback function |

