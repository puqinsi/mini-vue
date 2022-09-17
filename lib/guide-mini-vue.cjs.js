'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const extend = Object.assign;
const isObject = (obj) => {
    return obj !== null && typeof obj === "object";
};
const hasChanged = (value, newValue) => {
    return !Object.is(value, newValue);
};
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key);
const camelize = (str) => {
    return str.replace(/-(\w)/g, (_, c) => {
        return c ? c.toUpperCase() : "";
    });
};
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
const toHandlerKey = (str) => {
    return str ? "on" + capitalize(str) : "";
};

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    _fn;
    scheduler;
    deps = [];
    active = true;
    onStop;
    constructor(fn, scheduler) {
        this._fn = fn;
        this.scheduler = scheduler;
    }
    run() {
        shouldTrack = false;
        // 已 stop
        if (!this.active) {
            return this._fn();
        }
        // 应收集
        shouldTrack = true;
        activeEffect = this;
        const res = this._fn();
        // 重置全局变量
        shouldTrack = false;
        return res;
    }
    stop() {
        if (!this.active)
            return;
        cleanupEffect(this);
        this.active = false;
        if (this.onStop)
            this.onStop();
    }
}
// page 50: 分支切换与 cleanup TODO
function cleanupEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
    effect.deps.length = 0;
}
// 收集依赖
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    // target => key => dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    // 每个 activeEffect 存储所有被存储的的dep，为了 stop 时找到 activeEffect 所有对应的 dep，并从中删除，再触发依赖时不会执行
    activeEffect.deps.push(dep);
}
function isTracking() {
    return activeEffect !== undefined && shouldTrack;
}
// 触发依赖
function trigger(target, key) {
    const depsMap = targetMap.get(target);
    const dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            // 如果依赖收集中（表示副作用函数正在执行），如果执行中又要触发相同的副作用函数，会导致无限递归循环
            // TODO 可能不需要此功能，与 stop 一起使用？
            if (shouldTrack && effect.run === activeEffect.run)
                return;
            effect.run();
        }
    }
}
// scheduler 为调度器，控制副作用函数的执行时机
function effect(fn, options = {}) {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    _effect.run();
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReactiveGet = createGetter(false, true);
const shallowReadonlyGet = createGetter(true, true);
// 高阶函数
function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key) {
        // 根据是不是只读来判断
        if (key === "_v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "_v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        const res = Reflect.get(target, key);
        if (!isReadonly) {
            // 收集依赖
            track(target, key);
        }
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        // 触发依赖
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    set,
    get,
};
const readonlyHandlers = {
    set(target, key, value) {
        console.warn(`key: ${key} set failed because target is readonly`, target);
        return true;
    },
    get: readonlyGet,
};
extend({}, mutableHandlers, {
    get: shallowReactiveGet,
});
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function reactive(target) {
    return createActiveObj(target, mutableHandlers);
}
function readonly(target) {
    return createActiveObj(target, readonlyHandlers);
}
function shallowReadonly(target) {
    return createActiveObj(target, shallowReadonlyHandlers);
}
function createActiveObj(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn(`target ${target} 不是一个对象`);
        return;
    }
    return new Proxy(target, baseHandlers);
}

class RefImpl {
    _value;
    dep;
    _rawValue;
    _v_isRef;
    constructor(value) {
        this._rawValue = value;
        this._value = convert(value);
        this.dep = new Set();
        this._v_isRef = true;
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (hasChanged(this._rawValue, newValue)) {
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        }
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref._v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWidthRefs) {
    return new Proxy(objectWidthRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                // 特殊处理
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
}

function emit(instance, event, ...arg) {
    // instance.props -> event
    const { props } = instance;
    // TPP 先实现一个特定的行为，再重构成一个通用的行为
    // add -> Add
    // add-foo -> addFoo
    const handlerName = toHandlerKey(camelize(event));
    const handler = props[handlerName];
    handler & handler(...arg);
}

function initProps(instance, props) {
    // attrs
    instance.props = props || {};
}

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
    $slots: (i) => i.slots,
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function initSlots(instance, children) {
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOTS_CHILDREN */) {
        // children Object
        normalizeObjectSlots(children, instance.slots);
    }
}
function normalizeObjectSlots(children, slots) {
    for (const key in children) {
        const value = children[key];
        // slot
        slots[key] = (props) => normalizeSlotValue(value(props));
    }
}
function normalizeSlotValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: [],
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {},
        emit: () => { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulComponents(instance);
}
// 初始化组件
function setupStatefulComponents(instance) {
    const Component = instance.type;
    //此代理对象被称为 ctx
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
// 挂载 setup 数据到组件实例
function handleSetupResult(instance, setupResult) {
    // function object
    // TODO function
    if (typeof setupResult === "object") {
        // setup 脱 ref
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
// render 往外提了一层
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    // children 合并 shape
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    // component + children object
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag |= 16 /* ShapeFlags.SLOTS_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    if (typeof type === "string") {
        return 1 /* ShapeFlags.ELEMENT */;
    }
    else {
        return 2 /* ShapeFlags.STATEFUL_COMPONENT */;
    }
}

function createAppApi(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // component -> vnode -> patch
                // TODO 此时不是一个标准的 vnode，与 h 创建的不同 ？？？
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            },
        };
    };
}

// 把具体实现，改成接口传入形式，把具体功能抽象成公用功能
function createRenderer(options) {
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, } = options;
    // 注：此 render 和 instance.render 不是一回事
    function render(vnode, container) {
        patch(null, vnode, container, null);
    }
    // n1 -> old Vnode
    // n2 -> new Vnode
    function patch(n1, n2, container, parentComponent) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    // 处理 element 类型
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    // 去处理 component 类型
                    processComponent(n1, n2, container, parentComponent);
                }
        }
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    // 处理 element 类型
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            // 挂载元素
            mountElement(n2, container, parentComponent);
        }
        else {
            patchElement(n1, n2);
        }
    }
    function patchElement(n1, n2, container) {
        console.log("patchElement");
        console.log("n1", n1);
        console.log("n2", n2);
        // props diff
        // children diff
    }
    function mountElement(vnode, container, parentComponent) {
        const { type, props, children, shapeFlag } = vnode;
        const el = (vnode.el = hostCreateElement(type));
        // 添加属性
        for (const key in props) {
            const val = props[key];
            hostPatchProp(el, key, val);
        }
        // 添加内容
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode, el, parentComponent);
        }
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach((v) => {
            if (isObject(v)) {
                patch(null, v, container, parentComponent);
            }
        });
    }
    // 去处理 component 类型
    function processComponent(n1, n2, container, parentComponent) {
        // 挂载组件
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        // 创建组件 instance
        const instance = createComponentInstance(initialVNode, parentComponent);
        // 初始化 setup 数据
        setupComponent(instance);
        // 渲染组件
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(() => {
            const { proxy, isMounded, subTree: preSubTree } = instance;
            if (!isMounded) {
                console.log("init");
                // vnode -> patch，和 createApp mount 的处理一样
                const subTree = (instance.subTree =
                    instance.render.call(proxy));
                patch(null, subTree, container, instance);
                // 等组件处理完，所有 element 都创建好，添加到父节点上
                initialVNode.el = subTree.el;
                instance.isMounded = true;
            }
            else {
                console.log("update");
                const subTree = instance.render.call(proxy);
                instance.subTree = subTree;
                patch(preSubTree, subTree, container, instance);
            }
        });
    }
    return {
        createApp: createAppApi(render),
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        // function
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function provide(key, value) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = currentInstance.parent?.provides;
        // 只在初始化的时候重写 provides, 避免后面调用 provide 覆盖 provides
        if (provides === parentProvides) {
            // 利用原型链重写 provides, 解决 provides 引用覆盖问题
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const parentProvides = currentInstance.parent.provides;
        if (key in parentProvides) {
            return parentProvides[key];
        }
        if (typeof defaultValue === "function") {
            return defaultValue();
        }
        return defaultValue;
    }
}

function createElement(type) {
    // 创建元素 el -> element
    return document.createElement(type);
}
function patchProp(el, key, value) {
    // 通用处理
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        // 事件
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, value);
    }
    else {
        // 属性
        el.setAttribute(key, value);
    }
}
function insert(el, container) {
    // 添加到container
    container.append(el);
}
const renderer = createRenderer({ createElement, patchProp, insert });
// export const createApp = renderer.createApp;
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.ref = ref;
exports.renderSlots = renderSlots;
