import { shallowReadonly } from "../reactivity/reactive";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: [],
        emit: () => {},
    };

    component.emit = emit.bind(null, component) as any;
    return component;
}

export function setupComponent(instance: any) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);

    setupStatefulComponents(instance);
}

// 初始化组件
function setupStatefulComponents(instance: any) {
    const Component = instance.type;

    //此代理对象被称为 ctx
    instance.proxy = new Proxy({ _: instance }, publicInstanceProxyHandlers);

    const { setup } = Component;
    if (setup) {
        const setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });

        handleSetupResult(instance, setupResult);
    }
}

// 挂载 setup 数据到组件实例
function handleSetupResult(instance: any, setupResult: any) {
    // function object
    // TODO function
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }

    finishComponentSetup(instance);
}

// render 往外提了一层
function finishComponentSetup(instance: any) {
    const Component = instance.type;

    instance.render = Component.render;
}
