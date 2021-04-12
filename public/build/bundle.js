
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.37.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\App.svelte generated by Svelte v3.37.0 */

    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let div9;
    	let div2;
    	let div0;
    	let p0;
    	let t1;
    	let div1;
    	let input0;
    	let t2;
    	let br0;
    	let t3;
    	let div5;
    	let div3;
    	let p1;
    	let t5;
    	let div4;
    	let input1;
    	let t6;
    	let br1;
    	let t7;
    	let div8;
    	let div6;
    	let button;
    	let t9;
    	let div7;
    	let h3;
    	let t10;
    	let t11;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div9 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Kcal/100g:";
    			t1 = space();
    			div1 = element("div");
    			input0 = element("input");
    			t2 = space();
    			br0 = element("br");
    			t3 = space();
    			div5 = element("div");
    			div3 = element("div");
    			p1 = element("p");
    			p1.textContent = "Hur många gram:";
    			t5 = space();
    			div4 = element("div");
    			input1 = element("input");
    			t6 = space();
    			br1 = element("br");
    			t7 = space();
    			div8 = element("div");
    			div6 = element("div");
    			button = element("button");
    			button.textContent = "Räkna ut";
    			t9 = space();
    			div7 = element("div");
    			h3 = element("h3");
    			t10 = text(/*result*/ ctx[2]);
    			t11 = text(" kcal");
    			attr_dev(p0, "class", "svelte-117x45");
    			add_location(p0, file, 15, 6, 230);
    			attr_dev(div0, "class", "column svelte-117x45");
    			add_location(div0, file, 14, 3, 203);
    			attr_dev(input0, "id", "kcals");
    			attr_dev(input0, "type", "number");
    			attr_dev(input0, "class", "svelte-117x45");
    			add_location(input0, file, 18, 4, 286);
    			attr_dev(div1, "class", "column svelte-117x45");
    			add_location(div1, file, 17, 3, 261);
    			attr_dev(div2, "class", "row svelte-117x45");
    			add_location(div2, file, 13, 2, 182);
    			add_location(br0, file, 21, 2, 363);
    			attr_dev(p1, "class", "svelte-117x45");
    			add_location(p1, file, 24, 4, 416);
    			attr_dev(div3, "class", "column svelte-117x45");
    			add_location(div3, file, 23, 3, 391);
    			attr_dev(input1, "id", "grams");
    			attr_dev(input1, "type", "number");
    			attr_dev(input1, "class", "svelte-117x45");
    			add_location(input1, file, 27, 4, 477);
    			attr_dev(div4, "class", "column svelte-117x45");
    			add_location(div4, file, 26, 3, 452);
    			attr_dev(div5, "class", "row svelte-117x45");
    			add_location(div5, file, 22, 2, 370);
    			add_location(br1, file, 30, 2, 554);
    			attr_dev(button, "id", "btn-calculate");
    			attr_dev(button, "class", "svelte-117x45");
    			add_location(button, file, 33, 6, 609);
    			attr_dev(div6, "class", "column svelte-117x45");
    			add_location(div6, file, 32, 3, 582);
    			attr_dev(h3, "id", "result");
    			attr_dev(h3, "class", "svelte-117x45");
    			add_location(h3, file, 36, 4, 710);
    			attr_dev(div7, "class", "column svelte-117x45");
    			add_location(div7, file, 35, 3, 685);
    			attr_dev(div8, "class", "row svelte-117x45");
    			add_location(div8, file, 31, 2, 561);
    			attr_dev(div9, "class", "container svelte-117x45");
    			add_location(div9, file, 12, 1, 156);
    			attr_dev(main, "class", "svelte-117x45");
    			add_location(main, file, 11, 0, 148);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div9);
    			append_dev(div9, div2);
    			append_dev(div2, div0);
    			append_dev(div0, p0);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, input0);
    			set_input_value(input0, /*kcals*/ ctx[0]);
    			append_dev(div9, t2);
    			append_dev(div9, br0);
    			append_dev(div9, t3);
    			append_dev(div9, div5);
    			append_dev(div5, div3);
    			append_dev(div3, p1);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			append_dev(div4, input1);
    			set_input_value(input1, /*grams*/ ctx[1]);
    			append_dev(div9, t6);
    			append_dev(div9, br1);
    			append_dev(div9, t7);
    			append_dev(div9, div8);
    			append_dev(div8, div6);
    			append_dev(div6, button);
    			append_dev(div8, t9);
    			append_dev(div8, div7);
    			append_dev(div7, h3);
    			append_dev(h3, t10);
    			append_dev(h3, t11);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[4]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[5]),
    					listen_dev(button, "click", /*calc*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*kcals*/ 1 && to_number(input0.value) !== /*kcals*/ ctx[0]) {
    				set_input_value(input0, /*kcals*/ ctx[0]);
    			}

    			if (dirty & /*grams*/ 2 && to_number(input1.value) !== /*grams*/ ctx[1]) {
    				set_input_value(input1, /*grams*/ ctx[1]);
    			}

    			if (dirty & /*result*/ 4) set_data_dev(t10, /*result*/ ctx[2]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let kcals;
    	let grams;
    	let result = 0;

    	function calc() {
    		if (!kcals || !grams) return;
    		$$invalidate(2, result = kcals / 100 * grams);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		kcals = to_number(this.value);
    		$$invalidate(0, kcals);
    	}

    	function input1_input_handler() {
    		grams = to_number(this.value);
    		$$invalidate(1, grams);
    	}

    	$$self.$capture_state = () => ({ kcals, grams, result, calc });

    	$$self.$inject_state = $$props => {
    		if ("kcals" in $$props) $$invalidate(0, kcals = $$props.kcals);
    		if ("grams" in $$props) $$invalidate(1, grams = $$props.grams);
    		if ("result" in $$props) $$invalidate(2, result = $$props.result);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [kcals, grams, result, calc, input0_input_handler, input1_input_handler];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    		name: 'world'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
