declare module 'flatout' {
    interface HttpRequest {
        method: string;
        path: string;
        headers: Record<string, any>;
    }

    interface HttpResponse {
        /**
         * status code
        */
        status: number;
    
        /**
         * response header name and value object
         */
        headers: Record<string, any>;
    
        /**
         * response body
         */
        body: any;
    }

    /**
     * Http Error
     */
    class HttpError {
        /**
         * @param req request
         * @param resOrErr response or Error
         */
        constructor(req: HttpRequest, resOrErr: HttpResponse | Error);
    }

    /**
     * HTTP Client
     */
    class HttpClient {
        /**
         * do GET request.
         *
         * @param path - request path
         * @param [ctx] - context
         * @param [ctx.query] - request query data
         * @param [ctx.body] - request body
         * @param [ctx.headers] - header name and value object
         */
        get(path: string, ctx?: {
            query?: Record<string, any>;
            body?: any;
            headers?: Record<string, any>;
        }): Promise<HttpResponse>;

        /**
         * do POST request.
         *
         * @param path - request path
         * @param [ctx] - context
         * @param [ctx.query] - request query data
         * @param [ctx.body] - request body
         * @param [ctx.headers] - header name and value object
         */
        post(path: string, ctx?: {
            query?: Record<string, any>;
            body?: any;
            headers?: Record<string, any>;
        }): Promise<Response>;

        /**
         * do PUT request.
         *
         * @param path - request path
         * @param [ctx] - context
         * @param [ctx.query] - request query data
         * @param [ctx.body] - request body
         * @param [ctx.headers] - header name and value object
         * @return {Promise<Response>} Promise resolves response bodystatus: xhr.status,
         */
        put(path: string, ctx?: {
            query?: Record<string, any>;
            body?: any;
            headers?: Record<string, any>;
        }): Promise<HttpResponse>;

        /**
         * do PATCH request.
         *
         * @param path - request path
         * @param [ctx] - context
         * @param [ctx.query] - request query data
         * @param [ctx.body] - request body
         * @param [ctx.headers] - header name and value object
         * @return {Promise<Response>} Promise resolves response bodystatus: xhr.status,
         */
        patch(path: string, ctx?: {
            query?: Record<string, any>;
            body?: any;
            headers?: Record<string, any>;
        }): Promise<HttpResponse>;

        /**
         * do DELETE request.
         *
         * @param path - request path
         * @param [ctx] - context
         * @param [ctx.query] - request query data
         * @param [ctx.body] - request body
         * @param [ctx.headers] - header name and value object
         * @return {Promise<Response>} Promise resolves response bodystatus: xhr.status,
         */
        delete(path: string, ctx?: {
            query?: Record<string, any>;
            body?: any;
            headers?: Record<string, any>;
        }): Promise<HttpResponse>;

        /**
         * execute http request.
         *
         * @param method - method
         * @param path - request path
         * @param query - request query data
         * @param body - request body
         * @param headers - header name and value object
         */
        exec(method: string, path: string, query: Record<string, any>, body: string | any, headers: Record<string, any>): Promise<HttpResponse>;
    }

    type RouterMap = { [path: string]: typeof Page | string | RouterMap }

    namespace App {
        /**
         * Activate application
         *
         * @param rootViewClass - root view class.
         * @param routeMap - routing map.
         * @param [opts]          - options.
         * @param [opts.mode]     - HISTORY or HASH
         * @param [opts.rootPath] - history root path.
         * @param [opts.pathHead] - hash path prefix.
         */
        export function activate(rootViewClass: typeof View, routerMap: RouterMap, opts?: {
            mode: 'HISTORY' | 'HASH',
            rootPath?: string,
            pathHead?: string,
        }): void;
    }

    class Core {
        /**
         * Create a Core.
         */
        constructor();

        /**
         * Add handler or listener for saying message
         * @param nameOrObj - message name, '*' specify any listener.
         * @param handler - handler called on message received or listener.
         */
        listened(nameOrObj: string | Record<string, Function>, handler: Function): void;

        /**
         * Remove handler or listener
         * @param name - message name, '*' specify any listener.
         * @param handler - handler registered or listener registered.
         */
        unlistened(name: string, handler: Function | object): void;

        /**
         * Unescape HTML
         * @param escaped HTML string
         */
        unescapeHtml(escaped: String): String;

        /**
         * Cast a message to the listeners
         * @param name - message name
         * @param ctx - passing value
         */
        say(name: string, ctx: any): void;
    }

    /**
     * Item.
     * this can be an element of List.
     */
    class Item {
        /**
         * @param defaultData - default data
         */
        constructor(defaultData?: object);

        /**
         * Add value to field-value.
         * @param field - adding field name
         * @param value - adding value
         */
        add(field: string, value: any): void;

        /**
         * Toggle boolean field-value
         * @param field - toggling field name
         */
        toggle(field: string): void;

        /**
         * Update the pairs of field-value.
         * @param pairs - updating target pairs
         */
        update(pairs: Object): void;

        /**
         * Destroy me.
         */
        destroy(): void;
    }

    /**
     * List for plain object or Item.
     */
    class List {
        /**
         * @param defaultData - default data array
         * @param opts - options
         * @param opts.wrapItem - Whether wrapping Item or not, or the sub class of Item.
         */
        constructor(defaultData?: any[], opts?: {
            wrapItem: boolean | typeof Item
        });

        /**
         * If you dynamically change wrapping item class according to the item, override this method.
         * @param item - an item
         */
        itemClass(item: object): typeof View;

        /**
         * Return an item at position.
         * @param index - item position.
         */
        get(index: number): any;

        /**
         * Add an item.
         * @param item - item
         * @param insertIndex - optional insert position, add last if not defined
         */
        add(item: any, insertIndex?: number): void;

        /**
         * Update an item at index.
         * @param item - item
         * @param index - target index
         */
        update(item: any, index: number): void;

        /**
         * Remove an item (specified by index).
         * @param itemOrIndex - target item or the position.
         */
        remove(itemOrIndex: object | number): void;

        /**
         * Add items.
         * @param items - adding items
         * @param insertIndex - insert position
         */
        addAll(items: any[], insertIndex?: number): void;

        /**
         * Remove all items.
         * @param opts - if opts.reverse is true, removing from last to first.
         * @param opts.reverse - if true, removing from last to first.
         */
        removeAll(opts?: {
            reverse: boolean
        }): void;

        /**
         * Remove last item.
         */
        removeLast(): void;

        /**
         * replace all items
         * @param newValues - new values or default empty array
         */
        reset(newValues?: any[]): void;

        /**
         * Iterates each item of self, return an index of the first item predicate returns true.
         * @param predictOrField - predicate function or target field
         * @param value - finding value for target field
         */
        find(predictOrField: string | Function, value?: any): object;

        /**
         * Iterates each item of self, return the first item predicate returns true.
         * @param predictOrField - predicate function or target field, target object
         * @param value - finding value for target field
         */
        indexOf(predictOrField: string | Function | Object, value?: any): number;
    }

    class View {
        /**
         * Create a View.
         *
         * @param {object} [props] - Properties
         * @param {string|Element} [props.rootEl] - root element ID or root node
         * @param {Class<View>} [props.parent] - parent view this belongs to
         * @param {string|Element} [props.contentEl] - parent element of child views (specified by data-id or id value).
         */
        constructor(props?: {
            rootEl?: string | Element;
            parent?: typeof View;
            contentEl?: string | Element;
        });

        /**
         * data to elements text or value, innerHTML of elements
         */
        get data(): any;
        set data(value: any);

        /**
         * Root element
         */
        el: Element;

        /**
         * Subview children of the view
         */
        views: Record<string, View>;

        /**
         * Initialize props
         *
         * @param defaults - default data.
         */
        init(defaults: any): Record<string, any> | Item;

        /**
         * For implement creating subviews and setting listener of events.
         *
         * @param views - added subview target (ex. views.list = new ListView(..))
         */
        load(views: Record<string, View>): void;

        /**
         * Ssetting listener of events.
         *
         * @param evts - added listener target (ex. evts.subview_event)
         */
        handle(evts: Record<string, Function>): void;

        /**
         * For implement after loading completed
         */
        completed(): void;

        /**
         * For implement unloading subviews
         */
        unload(): void;

        /**
         * Cast a message to all children of view
         *
         * @param method - method name
         * @param args - arguments
         */
        broadcast(method: string, args: any[]): void;

        /**
         * Find an element that has specified data-id else call getElementById
         *
         * @param id data-id value
         */
        findEl(id: string): Element;

        /**
         * Append child element
         *
         * @param el - child element
         */
        appendEl(el: Element): void;

        /**
         * Add child view as name
         *
         * @param name - child name
         * @param view - child view
         */
        add(name: string, view: View): void;

        /**
         * Remove child view by name
         *
         * @param viewName - child view name
         */
        remove(viewName: string): void;

        /**
         * Fire event
         *
         * @param name - event name
         * @param ctx - event context
         */
        fire(name: string, ctx: any): void;

        /**
         * Destroy all chidren, unload, and destroy binder, teardown events
         */
        destroy(): void;

        /**
         * Called when the binding data is updated.
         *
         * @param name field name
         * @param newValue new data value
         * @param oldValue old data value
         */
        update(name: string, newValue: any, oldValue: any): boolean;
    }

    /**
    * View for the collection of items.
    */
    class ListView extends View {
        /**
         * @param [itemView] - item view class
         * @param [props] - Properties
         * @param [props.rootEl] - root element ID or root node
         * @param [props.parent] - parent view this belongs to
         * @param [props.contentEl] - parent element of child views (specified by data-id or id value).
         */
        constructor(itemView?: typeof View, props?: {
            rootEl: string | Element,
            parent: typeof View,
            contentEl: string | Element
        });

        /**
         * If you dynamically change creating item view according to the item, override this method.
         *
         * @param item - an item
         */
        itemViewClass(item: any | Item): typeof View;

        /**
         * Add an item to list
         *
         * @param item - an item
         */
        addItem(item: any | Item): View
    
        /**
         * Insert an item to list at index
         *
         * @param item - an item
         * @param index - target position
         */
        insertItem(item: any | Item, index: number): View;

        /**
         * Update an item at index
         *
         * @param item - an item
         * @param index - target position
         */
        updateItem(item: any | Item, index: number): void;

        /**
         * Remove item from list
         *
         * @param item - an item
         * @param index - target position
         */
        removeItem(item: any | Item, index: number): void;

        /**
         * Remove item with view
         *
         * @param view - an view of removing item
         */
        removeItemByView(view: View): void;

        /**
         * If you change adding item effect, override this method.
         *
         * @protected
         * @param listEl parent element for List
         * @param itemEl added element
         */
        addItemEl(listEl: Element, itemEl: Element): void;

        /**
         * If you change inserting item effect, override this method.
         *
         * @protected
         * @param listEl - parent element for List
         * @param newEl  - an element for new item for List
         * @param nextEl - next element will be next one for newEl
         */
        insertItemEl(listEl: Element, newEl: Element, nextEl: Element): void;

        /**
         * If you change removing item effect, override this method.
         *
         * @protected
         * @param listEl - parent element for List
         * @param itemEl - removed element
         */
        removeItemEl(listEl: Element, itemEl: Element): void;
    }

    /**
     * A FormView is data fields to bind input, select or textarea by theirs names.
     */
    class FormView extends View {
        /**
         * Get field value as the type.
         *
         * @param field - target field
         */
        getValueOf(field: string): any;
    }

    class Page extends View {
        /**
         * Return document title
         */
        title(): string;

        /**
         * Page Context
         */
        context: Record<string, any>;
    }
}
