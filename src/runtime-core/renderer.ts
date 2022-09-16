import { isObject } from "../shared/index";
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
    } = options;

    // 注：此 render 和 instance.render 不是一回事
    function render(vnode: any, container: any) {
        patch(vnode, container, null);
    }

    function patch(vnode: any, container: any, parentComponent: any) {
        const { type, shapeFlag } = vnode;
        switch (type) {
            case Fragment:
                processFragment(vnode, container, parentComponent);
                break;
            case Text:
                processText(vnode, container);
                break;
            default:
                if (shapeFlag & ShapeFlags.ELEMENT) {
                    // 处理 element 类型
                    processElement(vnode, container, parentComponent);
                } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
                    // 去处理 component 类型
                    processComponent(vnode, container, parentComponent);
                }
        }
    }

    function processFragment(vnode: any, container: any, parentComponent: any) {
        mountChildren(vnode, container, parentComponent);
    }

    function processText(vnode: any, container: any) {
        const { children } = vnode;
        const textNode = (vnode.el = document.createTextNode(children));
        container.append(textNode);
    }

    // 处理 element 类型
    function processElement(vnode: any, container: any, parentComponent: any) {
        // 挂载元素
        mountElement(vnode, container, parentComponent);
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
            mountChildren(vnode, el, parentComponent);
        }

        hostInsert(el, container);
    }

    function mountChildren(vnode: any, container: any, parentComponent: any) {
        vnode.children.forEach((v: any) => {
            if (isObject(v)) {
                patch(v, container, parentComponent);
            }
        });
    }

    // 去处理 component 类型
    function processComponent(
        vnode: any,
        container: any,
        parentComponent: any,
    ) {
        // 挂载组件
        mountComponent(vnode, container, parentComponent);
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
        const { proxy } = instance;

        // vnode -> patch，和 createApp mount 的处理一样
        const subTree = instance.render.call(proxy);
        patch(subTree, container, instance);

        // 等组件处理完，所有 element 都创建好，添加到父节点上
        initialVNode.el = subTree.el;
    }

    return {
        createApp: createAppApi(render),
    };
}
