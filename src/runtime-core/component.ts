export function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
    };
    return component;
}

export function setupComponent(instance: any) {
    // TODO
    // initProps();
    // initSlots();

    setupStatefulComponents(instance);
}

// 初始化组件
function setupStatefulComponents(instance: any) {
    const Component = instance.type;

    //此代理对象被称为 ctx
    instance.proxy = new Proxy(
        {},
        {
            get(target, key) {
                const { setupState } = instance;
                if (key in setupState) {
                    return setupState[key];
                }

                if (key === "$el") {
                    return instance.vnode.el;
                }
            },
        },
    );

    const { setup } = Component;
    if (setup) {
        const setupResult = setup();

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
