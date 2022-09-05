import { ShapeFlags } from "../shared/shapeFlags";

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

    return vnode;
}

function getShapeFlag(type: any) {
    if (typeof type === "string") {
        return ShapeFlags.ELEMENT;
    } else {
        return ShapeFlags.STATEFUL_COMPONENT;
    }
}