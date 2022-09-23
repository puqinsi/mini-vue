const extend = Object.assign;
const EMPTY_OBJ = {};
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
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

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
    $props: (i) => i.props,
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
        update: null,
        next: null,
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

function shouldUpdateComponent(prevVNode, nextVNode) {
    const { props: prevProps } = prevVNode;
    const { props: nextProps } = nextVNode;
    for (const key in nextProps) {
        if (nextProps[key] !== prevProps[key]) {
            return true;
        }
    }
    return false;
}

const Fragment = Symbol("Fragment");
const Text = Symbol("Text");
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        key: props ? props.key : "",
        shapeFlag: getShapeFlag(type),
        el: null,
        component: null,
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
    const { createElement: hostCreateElement, patchProp: hostPatchProp, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    // 注：此 render 和 instance.render 不是一回事
    function render(vnode, container) {
        patch(null, vnode, container, null, null);
    }
    // n1 -> old Vnode
    // n2 -> new Vnode
    function patch(n1, n2, container, parentComponent, anchor) {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
                    // 处理 element 类型
                    processElement(n1, n2, container, parentComponent, anchor);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    // 去处理 component 类型
                    processComponent(n1, n2, container, parentComponent, anchor);
                }
        }
    }
    function processFragment(n1, n2, container, parentComponent, anchor) {
        mountChildren(n2.children, container, parentComponent, anchor);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    // 处理 element 类型
    function processElement(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            // 挂载元素
            mountElement(n2, container, parentComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentComponent, anchor);
        }
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("patchElement");
        console.log("n1", n1);
        console.log("n2", n2);
        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);
        // children diff
        patchChildren(n1, n2, el, parentComponent, anchor);
        // props diff
        patchProps(el, oldProps, newProps);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const { shapeFlag: prevShapeFlag, children: c1 } = n1;
        const { shapeFlag, children: c2 } = n2;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            if (prevShapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
                unmountChildren(c1);
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        }
        else {
            if (prevShapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
                hostSetElementText(container, "");
                mountChildren(c2, container, parentComponent, anchor);
            }
            else {
                // Array diff Array
                patchKeyedChildren(c1, c2, container, parentComponent, anchor);
            }
        }
    }
    function patchKeyedChildren(c1, c2, container, parentComponent, anchor) {
        const l2 = c2.length;
        let i = 0;
        let e1 = c1.length - 1;
        let e2 = l2 - 1;
        function isSameVnodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }
        /* 算法：指针移动 */
        // 第一步：左侧对比，i 向右移
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVnodeType(n1, n2)) {
                // 继续 patch，可能 children 中有变化
                patch(n1, n2, container, parentComponent, anchor);
            }
            else {
                break;
            }
            i++;
        }
        // 第二步：右侧对比，e1, e2 向左移
        while (i <= e1 && i <= e2) {
            const n1 = c1[e1];
            const n2 = c2[e2];
            if (isSameVnodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, anchor);
            }
            else {
                break;
            }
            e1--;
            e2--;
        }
        /* 处理：针对指针的不同情况 */
        // 新的比老的长 -> 创建
        if (i > e1) {
            if (i <= e2) {
                const nextIndex = e2 + 1;
                // 左侧新增的首部插入（需要插入位 el），右侧新增的尾部插入（不需要插入位 el）
                const anchor = nextIndex < l2 ? c2[nextIndex].el : null;
                while (i <= e2) {
                    patch(null, c2[i], container, parentComponent, anchor);
                    i++;
                }
            }
        }
        else if (i > e2) {
            // 老的比新的长 -> 删除
            while (i <= e1) {
                // 把 prevChildren 中多的 child 的 el 删除
                hostRemove(c1[i].el);
                i++;
            }
        }
        else {
            /* 中间对比 */
            const s1 = i;
            const s2 = i;
            const toBePatch = e2 - i + 1;
            let patchCount = 0;
            // key -> newIndex 的映射。children 更新时 key 的作用，优化更新流程，如果 child 有绑定 key 可以直接映射查找，否则需要遍历查找
            const keyToNewIndexMap = new Map();
            // index（指的是需要 patch 的元素中的 index，不是 c2 中的 index） -> oldIndex（指的是 c1 中的 index）的映射。用定长数组优化性能
            const indexToOldIndexMap = new Array(toBePatch);
            let moved = false;
            let maxIndexSoFar = 0;
            // 初始化，0 表示 newIndex 在 prevChildren 中没有映射，需要新增
            for (let i = 0; i < toBePatch; i++)
                indexToOldIndexMap[i] = 0;
            for (let i = s2; i <= e2; i++) {
                keyToNewIndexMap.set(c2[i].key, i);
            }
            for (let i = s1; i <= e1; i++) {
                const prevChild = c1[i];
                // 超出 c2 变动部分的 child -> 删除
                if (patchCount >= toBePatch) {
                    hostRemove(prevChild.el);
                    continue;
                }
                // null undefined
                let newIndex;
                if (prevChild.key !== null) {
                    newIndex = keyToNewIndexMap.get(prevChild.key);
                }
                else {
                    for (let j = s2; j <= e2; j++) {
                        if (isSameVnodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                // prevChild 在 c2 中不存在 -> 删除
                if (newIndex === undefined) {
                    hostRemove(prevChild.el);
                }
                else {
                    // 优化移动：为何放在这里，因为 prevChild 在 c2 中存在才需要移动，判断 newIndex 是不是递增，不是的话需要移动
                    if (newIndex >= maxIndexSoFar) {
                        maxIndexSoFar = newIndex;
                    }
                    else {
                        moved = true;
                    }
                    // 注意：i 有可能是 0，因为 0 表示需要创建，所以用 i+1
                    indexToOldIndexMap[newIndex - s2] = i + 1;
                    // prevChild 在 c2 中存在 -> 更新
                    patch(prevChild, c2[newIndex], container, parentComponent, null);
                    patchCount++;
                }
            }
            // 求出最长递增子序列（稳定序列），内容是 indexToOldIndexMap 中的 index
            const increasingNewIndexSequence = moved
                ? getSequence(indexToOldIndexMap)
                : [];
            let j = increasingNewIndexSequence.length - 1;
            // 倒序移动，确保插入前的元素位置都是稳定的。
            for (let i = toBePatch - 1; i >= 0; i--) {
                const nextIndex = i + s2;
                const nextChild = c2[nextIndex];
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                // 如果没有到老节点的映射，表示新增 -> 创建
                if (indexToOldIndexMap[i] === 0) {
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                else if (moved) {
                    // 如果该位置的元素不是稳定序列中的元素 -> 移动
                    if (j < 0 || i !== increasingNewIndexSequence[j]) {
                        // 移动位置
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
        // 1. newProps 中属性值修改 -> 修改
        // 2. newProps 中属性值修改为 undefined | null -> 删除
        // 3. newProps 中属性删除 -> 删除
        if (oldProps !== newProps) {
            if (newProps !== EMPTY_OBJ) {
                for (const key in newProps) {
                    const nextProp = newProps[key];
                    const prevProp = oldProps[key];
                    if (prevProp !== nextProp) {
                        hostPatchProp(el, key, nextProp);
                    }
                }
            }
            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, null);
                    }
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent, anchor) {
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
            mountChildren(vnode.children, el, parentComponent, anchor);
        }
        hostInsert(el, container, anchor);
    }
    function mountChildren(children, container, parentComponent, anchor) {
        children.forEach((v) => {
            if (isObject(v)) {
                patch(null, v, container, parentComponent, anchor);
            }
        });
    }
    // 去处理 component 类型
    function processComponent(n1, n2, container, parentComponent, anchor) {
        if (!n1) {
            console.log("初始化 component");
            // 挂载组件
            mountComponent(n2, container, parentComponent, anchor);
        }
        else {
            console.log("更新 component");
            updateComponent(n1, n2);
        }
    }
    function updateComponent(n1, n2) {
        const instance = (n2.component = n1.component);
        if (shouldUpdateComponent(n1, n2)) {
            instance.next = n2;
            instance.update();
        }
    }
    function mountComponent(initialVNode, container, parentComponent, anchor) {
        // 创建组件 instance，把 instance 挂载到 vnode 上，component 更新逻辑要用
        const instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent));
        // 初始化 setup 数据
        setupComponent(instance);
        // 渲染组件
        setupRenderEffect(instance, initialVNode, container, anchor);
    }
    function setupRenderEffect(instance, initialVNode, container, anchor) {
        instance.update = effect(() => {
            const { proxy, isMounded, subTree: preSubTree } = instance;
            if (!isMounded) {
                console.log("init");
                // vnode -> patch，和 createApp mount 的处理一样
                const subTree = (instance.subTree =
                    instance.render.call(proxy));
                patch(null, subTree, container, instance, anchor);
                // 等组件处理完，所有 element 都创建好，添加到父节点上
                initialVNode.el = subTree.el;
                instance.isMounded = true;
            }
            else {
                console.log("update");
                const { next, vnode } = instance;
                if (next) {
                    next.el = vnode.el;
                    updateComponentPreRender(instance, next);
                }
                const subTree = instance.render.call(proxy);
                instance.subTree = subTree;
                patch(preSubTree, subTree, container, instance, anchor);
            }
        });
        // 对照 createComponentInstance，把与 vnode 更新相关的属性更新
        function updateComponentPreRender(instance, nextVNode) {
            instance.vnode = nextVNode;
            instance.next = null;
            instance.props = nextVNode.props;
        }
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
        if (value !== undefined && value !== null) {
            el.setAttribute(key, value);
        }
        else {
            el.removeAttribute(key, value);
        }
    }
}
function insert(child, container, anchor) {
    // 添加到 container
    container.insertBefore(child, anchor || null);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProp,
    insert,
    remove,
    setElementText,
});
// export const createApp = renderer.createApp;
function createApp(...args) {
    return renderer.createApp(...args);
}

export { createApp, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, ref, renderSlots };
