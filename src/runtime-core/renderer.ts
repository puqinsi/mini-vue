import { createComponentInstance, setupComponent } from "./component";

export function render(vnode: any, container: any) {
    // patch
    patch(vnode, container);
}

function patch(vnode: any, container: any) {
    // TODO
    // 处理 element 类型
    // 思考：如何区分 element 类型和 component 类型

    // 去处理 component 类型
    processComponent(vnode, container);
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
