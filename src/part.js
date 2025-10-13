let gParts = [];
const gValueMap = new WeakMap();

export function register(map) {
    gParts = Object.keys(map);
    for (const [name, cls] of Object.entries(map)) {
        customElements.define(name, cls);
    }
}

export class Part extends HTMLElement {
    static observedAttributes = ["kkValue"];

    constructor() {
        super();
        const sr = this.attachShadow({ mode: "open" });
        sr.appendChild(this.#createEl());
        this._data = this.data() || {};
    }

    connectedCallback() {
        console.log(`Part connected: ${this.localName}#${this.id}`);

        let cv = gValueMap.get(this);
        if (!cv) {
            cv = {};
            gValueMap.set(this, cv);
        }

        for (const key in this._data) {
            if (key in cv) {
                // only render
                const el = this._findEl(key);
                const val = cv[key];
                if (gParts.includes(el.localName)) {
                    this.#updateCE(el, val);
                } else {
                    this.#renderSE(el, val);
                }
            } else {
                // not set in attributeChangedCallback
                let val = this.getAttribute(key);
                const dv = this._data[key];
                if (val !== null) {
                    val = typeof dv === "string" ? val : Number(val);
                } else {
                    val = dv;
                }
                this.set(key, val);
            }
        }

        this._evts = [];
        for (const [key, map] of Object.entries(this.events())) {
            const el = this._findEl(key);
            if (!el) continue;
            const cbMap = {};
            for (const [name, handler] of Object.entries(map)) {
                const cb = (e) => handler(el, e);
                el.addEventListener(name, cb);
                cbMap[name] = cb;
            }
            this._evts.push([el, cbMap]);
        }

        this._sbsc = [];
        for (const [key, handler] of Object.entries(this.subscribe())) {
            const cb = (e) => handler(e.detail);
            document.addEventListener(`kkTopic_${key}`, cb);
            this._sbsc.push([key, cb]);
        }

        this.addEventListener("kkUp", this.#upReceiver);

        this.load();
    }

    disconnectedCallback() {
        console.log(`Part disconnected: ${this.localName}#${this.id}`);

        this.unload();

        this.removeEventListener("kkUp", this.#upReceiver);

        for (const [el, cbMap] of this._events) {
            for (const [name, cb] of Object.entries(cbMap)) {
                el.removeEventListener(name, cb);
            }
        }
        this._events = null;

        for (const [key, cb] of this._sbsc) {
            document.removeEventListener(`kkTopic_${key}`, cb);
        }
        this._sbsc = null;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Part attributeChanged: ${this.localName}#${this.id} ${name}=${newValue}`);

        if (name === "kkValue") {
            const nv = gValueMap.get(this);
            if (typeof nv === "object") {
                for (const elnm in nv) this.set(elnm, nv[elnm]);
            } else {
                this.#updateSE(this, key, nv);
            }
        }
    }

    html() {
        return ''
    }

    load() {}
    unload() {}

    events() {
        return {}
    }

    subscribe() {
        return {};
    }

    publish(topic, detail) {
        const evt = new CustomEvent(`kkTopic_${topic}`, { detail });
        document.dispatchEvent(evt);
    }

    data() {
        return {};
    }

    get(name) {
        return gValueMap.get(this)?.[name];
    }

    set(name, val) {
        const el = this._findEl(name);
        if (!el) return;

        if (gParts.includes(el.localName)) {
            this.#updateCE(el, val);
        } else {
            this.#updateSE(el, name, val);
        }
    }

    add(name, delta) {
        let v = this.get(name);
        this.set(name, v + delta);
    }

	/**
	 * 上位要素に向けてデータ更新イベントを発行
	 */
	up(name, value) {
        const evt = new CustomEvent("kkUp", { detail: { name, value }, bubbles: true });
		this.dispatchEvent(evt);
	}

    create(tagName, id, value = {}) {
        const el = document.createElement(tagName);
        el.id = id;
        gValueMap.set(el, value);
        return el;
    }

    _findEl(id) {
        const sel = this.shadowRoot.querySelector(`#${id}`);
        if (sel) return sel;
        return this.querySelector(`[data-id="${id}"]`);
    }

    #createEl() {
        const template = document.createElement("template");
        template.innerHTML = this.html();
        return template.content.cloneNode(true);
    }

    #upReceiver(e) {
        const { name, value } = e.detail;
        if (this.id === name || this.getAttribute("data-id") === name) {
            this.kkValue = value;
            e.stopPropagation();
        }
    }

    #updateCE(el, val) {
        gValueMap.set(el, val);
        el.setAttribute("kkValue", el.getAttribute("kkValue") ? "" : "!");
    }

    #updateSE(el, key, val) {
        gValueMap.get(this)[key] = val;
        this.#renderSE(el, val);
    }

    #renderSE(el, val) {
        if (el.hasAttribute("value")) {
            el.value = val;
        } else {
            el.textContent = val;
        }
    }
}
