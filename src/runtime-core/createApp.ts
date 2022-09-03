import { render } from "./renderer";
import { createVNode } from "./vnode";

export function createApp(rootComponent: any) {
    return {
        mount(rootContainer: any) {
            // component -> vnode -> patch
            // TODO 此时不是一个标准的 vnode，与 h 创建的不同 ？？？
            const vnode = createVNode(rootComponent);

            render(vnode, rootContainer);
        },
    };
}
