import { render } from "./renderer";
import { createVNode } from "./vnode";

export function createApp(rootComponent: any) {
    return {
        mount(rootContainer: any) {
            // vue3
            // component => vnode
            const vnode = createVNode(rootComponent);

            render(vnode, rootContainer);
        },
    };
}
