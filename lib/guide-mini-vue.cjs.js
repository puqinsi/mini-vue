'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const isObject = (obj) => {
    return obj !== null && typeof obj === "object";
};

const publicPropertiesMap = {
    $el: (i) => i.vnode.el,
};
const publicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState } = instance;
        if (key in setupState) {
            return setupState[key];
        }
        const publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function createComponentInstance(vnode) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
    };
    return component;
}
function setupComponent(instance) {
    // TODO
    // initProps();
    // initSlots();
    setupStatefulComponents(instance);
}
// 初始化组件
function setupStatefulComponents(instance) {
    const Component = instance.type;
    //此代理对象被称为 ctx
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        const setupResult = setup();
        handleSetupResult(instance, setupResult);
    }
}
// 挂载 setup 数据到组件实例
function handleSetupResult(instance, setupResult) {
    // function object
    // TODO function
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
// render 往外提了一层
function finishComponentSetup(instance) {
    const Component = instance.type;
    instance.render = Component.render;
}

// 注：此 render 和 instance.render 不是一回事
function render(vnode, container) {
    patch(vnode, container);
}
function patch(vnode, container) {
    if (typeof vnode.type === "string") {
        // 处理 element 类型
        processElement(vnode, container);
    }
    else if (isObject(vnode)) {
        // 去处理 component 类型
        processComponent(vnode, container);
    }
}
function processElement(vnode, container) {
    // 挂载元素
    mountElement(vnode, container);
}
function mountElement(vnode, container) {
    const { type, props, children } = vnode;
    // 创建元素 el -> element
    const el = (vnode.el = document.createElement(type));
    // 添加属性
    for (const key in props) {
        el.setAttribute(key, props[key]);
    }
    // 添加内容
    if (typeof children === "string") {
        el.textContent = children;
    }
    else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }
    // 添加到container
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach((v) => {
        if (typeof v === "string") {
            const textNode = document.createTextNode(v);
            container.appendChild(textNode);
        }
        else if (isObject(v)) {
            patch(v, container);
        }
    });
}
function processComponent(vnode, container) {
    // 挂载组件
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    // 创建组件 instance
    const instance = createComponentInstance(initialVNode);
    // 初始化 setup 数据
    setupComponent(instance);
    // 渲染组件
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    const { proxy } = instance;
    // vnode -> patch，和 createApp mount 的处理一样
    const subTree = instance.render.call(proxy);
    patch(subTree, container);
    // 等组件处理完，所有 element 都创建好，添加到父节点上
    initialVNode.el = subTree.el;
}

function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        el: null,
    };
    return vnode;
}

function createApp(rootComponent) {
    return {
        mount(rootContainer) {
            // component -> vnode -> patch
            // TODO 此时不是一个标准的 vnode，与 h 创建的不同 ？？？
            const vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
