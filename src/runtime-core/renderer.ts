import { createComponentInstance, setupComponent } from "./component";

export function render(vnode: any, container: any) {
    // patch
    patch(vnode, container);
}

function patch(vnode: any, container: any) {
    // 去处理组件
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
