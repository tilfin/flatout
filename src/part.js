let PARTS = [];
const foValueMap = new WeakMap();

export function register(map) {
    PARTS = Object.keys(map);
    for (const [name, cls] of Object.entries(map)) {
        customElements.define(name, cls);
    }
}

export class Part extends HTMLElement {
    static observedAttributes = ["fovalue"];

    constructor() {
        super();
        const sr = this.attachShadow({ mode: "open" });
        sr.appendChild(this._buildFromHtml());
        this._data = this.data() || {};
    }

    connectedCallback() {
        let cv = foValueMap.get(this);
        if (!cv) {
            cv = {};
            foValueMap.set(this, cv);
        }
        for (const key in this._data) {
            if (!(key in cv)) {
                // not set in attributeChangedCallback
                let val = this.getAttribute(key);
                const dv = this._data[key];
                if (val !== null) {
                    val = typeof dv === "string" ? val : Number(val);
                } else {
                    val = dv;
                }
                const el = this._findEl(key);
                if (el) this._setVal(el, val);
                cv[key] = val;
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
            document.addEventListener(`fotopic_${key}`, cb);
            this._sbsc.push([key, cb]);
        }

        this.addEventListener("foupdate", this._updateReceiver);
    }

    disconnectedCallback() {
        this.removeEventListener("foupdate", this._updateReceiver);

        for (const [el, cbMap] of this._events) {
            for (const [name, cb] of Object.entries(cbMap)) {
                el.removeEventListener(name, cb);
            }
        }
        this._events = null;

        for (const [key, cb] of this._sbsc) {
            document.removeEventListener(`fotopic_${key}`, cb);
        }
        this._sbsc = null;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "fovalue") {
            const nv = foValueMap.get(this);
            this._value = nv;
            if (typeof nv === "object") {
                for (const key in nv) {
                    let el = this.shadowRoot.querySelector(`#${key}`);
                    if (el) {
                        this._setVal(el, nv[key]);
                    }
                }
            } else {
                this._setVal(this, nv);
                this.textContent = nv;
            }
        }
    }

    html() {
        return ''
    }

    events() {
        return {}
    }

    subscribe() {
        return {};
    }

    publish(topic, detail) {
        const evt = new CustomEvent(`fotopic_${topic}`, { detail });
        document.dispatchEvent(event);
    }

    get(name) {
        return foValueMap[this]?.[name];
    }

    set(name, value) {
       const el = this._findEl(name);
       if (el) this._setVal(el, value);
    }

	/**
	 * 上位要素に向けてデータ更新イベントを発行
	 */
	update(name, value) {
		const evt = new CustomEvent("foupdate", { detail: { name, value }, bubbles: true });
		this.dispatchEvent(e);
	}

    _buildFromHtml() {
        const template = document.createElement("template");
        template.innerHTML = this.html();
        return template.content.cloneNode(true);
    }

    _findEl(id) {
        const sel = this.shadowRoot.querySelector(`#${id}`);
        if (sel) return sel;
        const el = this.querySelector(`[data-id="${id}"]`);
        return el;
    }

    _updateReceiver(e) {
        const { name, value } = e.detail;
        if (this.id === name || this.getAttribute("data-id") === name) {
            this.fovalue = value;
            e.stopPropagation();
        }
    }

    _setVal(el, val) {
        if (PARTS.includes(el.localName)) {
            foValueMap.set(el, val);
            el.setAttribute("fovalue", el.getAttribute("fovalue") ? "" : "!");
        } else if (el.hasAttribute("value")) {
            el.value = val;
        } else {
            el.textContent = val;
        }
    }
}
