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
    // 创建元素
    const el = document.createElement(type);

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
    const instance = createComponentInstance(vnode);
    setupComponent(instance);

    setupRenderEffect(instance, container);
}

function setupRenderEffect(instance: any, container: any) {
    const subTree = instance.render();

    // vnode => patch
    // vnode => element => mountElement

    patch(subTree, container);
}
