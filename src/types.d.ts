declare module '@tilfin/flatout' {
    global {
        interface Window {
            /**
             * initial page data if SSR
             */
            initPageData?: any
        }
    }

    type ClassType<T> = { new (...args: any[]): T }

    interface HttpRequest {
        method: string;
        path: string;
        headers: Record<string, any>;
    }

    interface HttpResponse<T> {
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
        body: T;
    }

    /**
     * Http Error
     */
    class HttpError {
        /**
         * @param req request
         * @param resOrErr response or Error
         */
        constructor(req: HttpRequest, resOrErr: HttpResponse<any> | Error);
    }

    /**
     * HTTP Client
     */
    class HttpClient {
        /**
         * Constructor.
         * 
         * @param {object} [opts] - options
         * @param {string} [opts.baseURL] - base URL (default empty).
         * @param {object} [opts.headers] - custom headers
         * @param {string} [opts.bodyType] - body type.
         */
        constructor(opts?: {
            baseURL?: string,
            headers?: Record<string, any>,
            bodyType?: string
        });

        /**
         * hook async function called before the request.
         * 
         * @param  {String} path - request path
         * @param  {object} [ctx] - context
         * @param  {object} [ctx.query] - request query data
         * @param  {object} [ctx.body] - request body
         * @param  {object} [ctx.headers] - header name and value object
         */
        beforeRequest(path: string, ctx?: {
            query?: Record<string, any>;
            body?: any;
            headers?: Record<string, any>;
        }): Promise<void>;

        /**
         * hook async function called before throw an error. 
         * 
         * @param  {HttpError} err - request path
         * @return {Promise<boolean>} - if return false, stop throwing the error.
         */
        beforeError(err: HttpError): Promise<boolean>;

        /**
         * do GET request.
         *
         * @param path - request path
         * @param [ctx] - context
         * @param [ctx.query] - request query data
         * @param [ctx.body] - request body
         * @param [ctx.headers] - header name and value object
         * @return {Promise<HttpResponse>} Promise resolves response bodystatus: xhr.status,
         */
        get<T = any>(path: string, ctx?: {
            query?: Record<string, any>;
            body?: any;
            headers?: Record<string, any>;
        }): Promise<HttpResponse<T>>;

        /**
         * do POST request.
         *
         * @param path - request path
         * @param [ctx] - context
         * @param [ctx.query] - request query data
         * @param [ctx.body] - request body
         * @param [ctx.headers] - header name and value object
         * @return {Promise<HttpResponse>} Promise resolves response bodystatus: xhr.status,
         */
        post<T = any>(path: string, ctx?: {
            query?: Record<string, any>;
            body?: any;
            headers?: Record<string, any>;
        }): Promise<HttpResponse<T>>;

        /**
         * do PUT request.
         *
         * @param path - request path
         * @param [ctx] - context
         * @param [ctx.query] - request query data
         * @param [ctx.body] - request body
         * @param [ctx.headers] - header name and value object
         * @return {Promise<HttpResponse>} Promise resolves response bodystatus: xhr.status,
         */
        put<T = any>(path: string, ctx?: {
            query?: Record<string, any>;
            body?: any;
            headers?: Record<string, any>;
        }): Promise<HttpResponse<T>>;

        /**
         * do PATCH request.
         *
         * @param path - request path
         * @param [ctx] - context
         * @param [ctx.query] - request query data
         * @param [ctx.body] - request body
         * @param [ctx.headers] - header name and value object
         * @return {Promise<HttpResponse>} Promise resolves response bodystatus: xhr.status,
         */
        patch<T = any>(path: string, ctx?: {
            query?: Record<string, any>,
            body?: any,
            headers?: Record<string, any>,
        }): Promise<HttpResponse<T>>;

        /**
         * do DELETE request.
         *
         * @param path - request path
         * @param [ctx] - context
         * @param [ctx.query] - request query data
         * @param [ctx.body] - request body
         * @param [ctx.headers] - header name and value object
         * @return {Promise<HttpResponse>} Promise resolves response bodystatus: xhr.status,
         */
        delete<T = any>(path: string, ctx?: {
            query?: Record<string, any>,
            body?: any,
            headers?: Record<string, any>,
        }): Promise<HttpResponse<T>>;

        /**
         * execute http request.
         *
         * @param method - method
         * @param path - request path
         * @param query - request query data
         * @param body - request body
         * @param headers - header name and value object
         * @return {Promise<HttpResponse>} Promise resolves response bodystatus: xhr.status,
         */
        exec<T = any>(method: string, path: string, query: Record<string, any>, body: string | any, headers: Record<string, any>): Promise<HttpResponse<T>>;
    }

    type RouterMap = { [path: string]: ClassType<Page> | string | RouterMap }

    namespace App {
        /**
         * Activate application.
         *
         * @param rootViewClass - root view class.
         * @param routeMap - routing map.
         * @param [opts]          - options.
         * @param [opts.mode]     - HISTORY or HASH
         * @param [opts.rootPath] - history root path.
         * @param [opts.pathHead] - hash path prefix.
         */
        export function activate(rootViewClass: ClassType<View>, routerMap: RouterMap, opts?: {
            mode: 'HISTORY' | 'HASH',
            rootPath?: string,
            pathHead?: string,
        }): void;

        /**
         * Go a page.
         *
         * @param {string} path - URL path
         * @param {Object} [ctx] - context
         */
        export function go(path: string, ctx?: any): boolean;

        /**
         * Back a page.
         */
        export function back(): boolean;

        /**
         * Replace a page.
         *
         * @param {Class<Page>} page - Page class
         * @param {Object} [ctx] - context
         */
        export function replace(page: ClassType<Page>, ctx?: any): boolean;
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
         * @param [handler] - handler registered or listener registered. all registered handler will be removed if not specified.
         */
        unlistened(name: string, handler?: Function): void;

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
    class Item<T> {
        /**
         * @param defaultData - default data
         */
        constructor(defaultData?: object);

        /**
         * Add value to field-value.
         * @param field - adding field name
         * @param value - adding value
         */
        add<P extends keyof T>(field: P, value: T[P]): void;

        /**
         * Toggle boolean field-value
         * @param field - toggling field name
         */
        toggle<P extends keyof T>(field: P): void;

        /**
         * Update the pairs of field-value.
         * @param pairs - updating target pairs
         */
        update(pairs: Partial<T>): void;

        /**
         * Destroy me.
         */
        destroy(): void;
    }

    /**
     * List for plain object or Item.
     */
    class List<T> {
        /**
         * @param defaultData - default data array
         * @param opts - options
         * @param opts.wrapItem - Whether wrapping Item or not, or the sub class of Item.
         */
        constructor(defaultData?: any[], opts?: {
            wrapItem: boolean | ClassType<T>
        });

        /**
         * If you dynamically change wrapping item class according to the item, override this method.
         * @param item - an item
         */
        itemClass(item: object): ClassType<T>;

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
        add(item: T, insertIndex?: number): void;

        /**
         * Update an item at index.
         * @param item - item
         * @param index - target index
         */
        update(item: T, index: number): void;

        /**
         * Remove an item (specified by index).
         * @param itemOrIndex - target item or the position.
         */
        remove(itemOrIndex: T | number): void;

        /**
         * Add items.
         * @param items - adding items
         * @param insertIndex - insert position
         */
        addAll(items: T[], insertIndex?: number): void;

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
        reset(newValues?: T[]): void;

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

    type EventHandler<EL extends Element, EVT extends Event> = (sender: EL, e: EVT) => void
    type ViewMap<T = any> = { [P in keyof T]: View<T[P] | any> }
    type EventMap = Record<string, EventHandler<any, any>>

    class View<ItemData = any> {
        /**
         * Create a View.
         *
         * @param {object} [props] - Properties
         * @param {string|Element} [props.rootEl] - root element ID or root node
         * @param {Class<View>} [props.parent] - parent view this belongs to
         * @param {string|Element} [props.contentEl] - parent element of child views (specified by data-id or id value).
         */
        constructor(props?: {
            rootEl?: string | Element,
            parent?: ClassType<View>,
            contentEl?: string | Element,
            [field: string]: any,
        });

        /**
         * data to elements text or value, innerHTML of elements
         */
        get data(): ItemData;
        set data(value: ItemData);

        /**
         * Root element
         */
        el: Element;

        /**
         * Subview children of the view
         */
        views: ViewMap<ItemData>;

        /**
         * Prepare data
         *
         * @param defaults - default data.
         * @return modified data or item.
         */
         defaults(defaults: any): ItemData;

        /**
         * For implement building HTML of this view
         *
         * @param data - the data of this view
         */
        html(data: ItemData): string;

        /**
         * For implement creating subviews and setting listener of events.
         *
         * @param views - added subview target (ex. views.list = new ListView(..))
         */
        load(views: ViewMap<ItemData>): void;

        /**
         * Ssetting listener of events.
         *
         * @param evts - added listener target (ex. evts.subview_event)
         */
        handle(evts: EventMap): void;

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
         * Set child view as name after load
         *
         * @param name - view name
         * @param [view] - child view. remove if null, replace one if exist
         */
        set<Name extends keyof ItemData>(name: Name, view?: View<ItemData[Name]>): void;

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
    class ListView<ItemData = any> extends View<List<ItemData>> {
        /**
         * @param [itemView] - item view class
         * @param [props] - Properties
         * @param [props.rootEl] - root element ID or root node
         * @param [props.parent] - parent view this belongs to
         * @param [props.contentEl] - parent element of child views (specified by data-id or id value).
         */
        constructor(itemView?: ClassType<View<ItemData>>, props?: {
            rootEl: string | Element,
            parent: ClassType<View>,
            contentEl: string | Element
        });

        /**
         * If you dynamically change creating item view according to the item, override this method.
         *
         * @param item - an item
         */
        itemViewClass(item: ItemData): ClassType<View<ItemData>>;

        /**
         * Add an item to list
         *
         * @param item - an item
         */
        addItem(item: ItemData): View<ItemData>;
    
        /**
         * Insert an item to list at index
         *
         * @param item - an item
         * @param index - target position
         */
        insertItem(item: ItemData, index: number): View<ItemData>;

        /**
         * Update an item at index
         *
         * @param item - an item
         * @param index - target position
         */
        updateItem(item: ItemData, index: number): void;

        /**
         * Remove item from list
         *
         * @param item - an item
         * @param index - target position
         */
        removeItem(item: ItemData, index: number): void;

        /**
         * Remove item with view
         *
         * @param view - an view of removing item
         */
        removeItemByView(view: View<ItemData>): void;

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
    class FormView<T = any> extends View<T> {
        /**
         * Get field value as the type.
         *
         * @param field - target field
         */
        getValueOf(field: string): any;
    }

    class Page<T = any> extends View<T> {
        /**
         * Whether having initial data or not
         */
        hasInitData: boolean;

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
