import { isObject } from "../shared";
import { createComponentInstance, setupComponent } from "./component";

export function render(vnode: any, container: any) {
    // patch
    patch(vnode, container);
}

function patch(vnode: any, container: any) {
    if (typeof vnode.type === "string") {
        // 处理 element 类型
        processElement(vnode, container);
    } else if (isObject(vnode)) {
        // 去处理 component 类型
        processComponent(vnode, container);
    }
}

function processElement(vnode: any, container: any) {
    // 挂载元素
    mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
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
    } else if (Array.isArray(children)) {
        mountChildren(vnode, el);
    }

    // 添加到container
    container.append(el);
}

function mountChildren(vnode: any, container: any) {
    vnode.children.forEach((v: any) => {
        if (typeof v === "string") {
            const textNode = document.createTextNode(v);
            container.appendChild(textNode);
        } else if (isObject(v)) {
            patch(v, container);
        }
    });
}

function processComponent(vnode: any, container: any) {
    // 挂载组件
    mountComponent(vnode, container);
}

function mountComponent(vnode: any, container: any) {
    // 创建组件 instance
    const instance = createComponentInstance(vnode);
    // 初始化 setup 数据
    setupComponent(instance);
    // 渲染组件
    setupRenderEffect(instance, vnode, container);
}

function setupRenderEffect(instance: any, vnode: any, container: any) {
    const { proxy } = instance;
    const subTree = instance.render.call(proxy);

    // vnode => patch
    // vnode => element => mountElement
    patch(subTree, container);

    // 等组件处理完，element 也就生产好了
    vnode.el = subTree.el;
}
