import { isObject } from "../shared";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";

// 注：此 render 和 instance.render 不是一回事
export function render(vnode: any, container: any) {
    patch(vnode, container);
}

function patch(vnode: any, container: any) {
    const { shapeFlag } = vnode;
    if (shapeFlag & ShapeFlags.ELEMENT) {
        // 处理 element 类型
        processElement(vnode, container);
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        // 去处理 component 类型
        processComponent(vnode, container);
    }
}

function processElement(vnode: any, container: any) {
    // 挂载元素
    mountElement(vnode, container);
}

function mountElement(vnode: any, container: any) {
    const { type, props, children, shapeFlag } = vnode;
    // 创建元素 el -> element
    const el = (vnode.el = document.createElement(type));

    // 添加属性
    for (const key in props) {
        el.setAttribute(key, props[key]);
    }

    // 添加内容
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
        el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
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

function mountComponent(initialVNode: any, container: any) {
    // 创建组件 instance
    const instance = createComponentInstance(initialVNode);
    // 初始化 setup 数据
    setupComponent(instance);
    // 渲染组件
    setupRenderEffect(instance, initialVNode, container);
}

function setupRenderEffect(instance: any, initialVNode: any, container: any) {
    const { proxy } = instance;

    // vnode -> patch，和 createApp mount 的处理一样
    const subTree = instance.render.call(proxy);
    patch(subTree, container);

    // 等组件处理完，所有 element 都创建好，添加到父节点上
    initialVNode.el = subTree.el;
}
