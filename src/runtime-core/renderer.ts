import { effect } from "../reactivity/effect";
import { EMPTY_OBJ, isObject } from "../shared/index";
import { ShapeFlags } from "../shared/shapeFlags";
import { createComponentInstance, setupComponent } from "./component";
import { createAppApi } from "./createApp";
import { Fragment, Text } from "./vnode";

// 把具体实现，改成接口传入形式，把具体功能抽象成公用功能
export function createRenderer(options: any) {
    const {
        createElement: hostCreateElement,
        patchProp: hostPatchProp,
        insert: hostInsert,
        remove: hostRemove,
        setElementText: hostSetElementText,
    } = options;

    // 注：此 render 和 instance.render 不是一回事
    function render(vnode: any, container: any) {
        patch(null, vnode, container, null);
    }

    // n1 -> old Vnode
    // n2 -> new Vnode
    function patch(
        n1: any,
        n2: any,
        container: any,
        parentComponent: any,
    ): void {
        const { type, shapeFlag } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 处理 element 类型
                    processElement(n1, n2, container, parentComponent);
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 去处理 component 类型
                    processComponent(n1, n2, container, parentComponent);
                }
        }
    }

    function processFragment(
        n1: any,
        n2: any,
        container: any,
        parentComponent: any,
    ) {
        mountChildren(n2.children, container, parentComponent);
    }

    function processText(n1: any, n2: any, container: any) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }

    // 处理 element 类型
    function processElement(
        n1: any,
        n2: any,
        container: any,
        parentComponent: any,
    ) {
        if (!n1) {
            // 挂载元素
            mountElement(n2, container, parentComponent);
        } else {
            patchElement(n1, n2, container, parentComponent);
        }
    }

    function patchElement(
        n1: any,
        n2: any,
        container: any,
        parentComponent: any,
    ) {
        console.log("patchElement");
        console.log("n1", n1);
        console.log("n2", n2);

        const oldProps = n1.props || EMPTY_OBJ;
        const newProps = n2.props || EMPTY_OBJ;
        const el = (n2.el = n1.el);

        // children diff
        patchChildren(n1, n2, el, parentComponent);
        // props diff
        patchProps(el, oldProps, newProps);
    }

    function patchChildren(
        n1: any,
        n2: any,
        container: any,
        parentComponent: any,
    ) {
        const { shapeFlag: prevShapeFlag, children: c1 } = n1;
        const { shapeFlag, children: c2 } = n2;
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
                unmountChildren(c1);
            }
            if (c1 !== c2) {
                hostSetElementText(container, c2);
            }
        } else {
            if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
                hostSetElementText(container, "");
                mountChildren(c2, container, parentComponent);
            } else {
                // TODO
            }
        }
    }

    function unmountChildren(children: any) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }

    function patchProps(el: any, oldProps: any, newProps: any) {
        // 1. newProps 中属性值修改 -> 修改
        // 2. newProps 中属性值修改为 undefined | null -> 删除
        // 3. newProps 中属性删除 -> 删除
        if (oldProps !== newProps) {
            if (newProps !== EMPTY_OBJ) {
                for (const key in newProps) {
                    const nextProp = newProps[key];
                    const prevProp = oldProps[key];
                    if (prevProp !== nextProp) {
                        hostPatchProp(el, key, nextProp);
                    }
                }
            }

            if (oldProps !== EMPTY_OBJ) {
                for (const key in oldProps) {
                    if (!(key in newProps)) {
                        hostPatchProp(el, key, null);
                    }
                }
            }
        }
    }

    function mountElement(vnode: any, container: any, parentComponent: any) {
        const { type, props, children, shapeFlag } = vnode;

        const el = (vnode.el = hostCreateElement(type));
        // 添加属性
        for (const key in props) {
            const val = props[key];

            hostPatchProp(el, key, val);
        }

        // 添加内容
        if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
            el.textContent = children;
        } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
            mountChildren(vnode.children, el, parentComponent);
        }

        hostInsert(el, container);
    }

    function mountChildren(
        children: any,
        container: any,
        parentComponent: any,
    ) {
        children.forEach((v: any) => {
            if (isObject(v)) {
                patch(null, v, container, parentComponent);
            }
        });
    }

    // 去处理 component 类型
    function processComponent(
        n1: any,
        n2: any,
        container: any,
        parentComponent: any,
    ) {
        // 挂载组件
        mountComponent(n2, container, parentComponent);
    }

    function mountComponent(
        initialVNode: any,
        container: any,
        parentComponent: any,
    ) {
        // 创建组件 instance
        const instance = createComponentInstance(initialVNode, parentComponent);

        // 初始化 setup 数据
        setupComponent(instance);

        // 渲染组件
        setupRenderEffect(instance, initialVNode, container);
    }

    function setupRenderEffect(
        instance: any,
        initialVNode: any,
        container: any,
    ) {
        effect(() => {
            const { proxy, isMounded, subTree: preSubTree } = instance;
            if (!isMounded) {
                console.log("init");
                // vnode -> patch，和 createApp mount 的处理一样
                const subTree = (instance.subTree =
                    instance.render.call(proxy));
                patch(null, subTree, container, instance);

                // 等组件处理完，所有 element 都创建好，添加到父节点上
                initialVNode.el = subTree.el;

                instance.isMounded = true;
            } else {
                console.log("update");
                const subTree = instance.render.call(proxy);
                instance.subTree = subTree;

                patch(preSubTree, subTree, container, instance);
            }
        });
    }

    return {
        createApp: createAppApi(render),
    };
}
