import { ShapeFlags } from "../shared/shapeFlags";

export const Fragment = Symbol("Fragment");
export const Text = Symbol("Text");

export function createVNode(type: any, props?: any, children?: any) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };

    // children 合并 shape
    if (typeof children === "string") {
        vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
    } else if (Array.isArray(children)) {
        vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN;
    }

    // component + children object
    if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        if (typeof children === "object") {
            vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN;
        }
    }
    return vnode;
}

export function createTextVNode(text: string) {
    return createVNode(Text, {}, text);
}

function getShapeFlag(type: any) {
    if (typeof type === "string") {
        return ShapeFlags.ELEMENT;
    } else {
        return ShapeFlags.STATEFUL_COMPONENT;
    }
}
