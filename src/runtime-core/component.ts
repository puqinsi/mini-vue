export function createComponentInstance(vnode: any) {
    const component = {
        vnode,
        type: vnode.type,
    };
    return component;
}

export function setupComponent(instance: any) {
    // TODO
    // initProps();
    // initSlots();

    setupStatefulComponents(instance);
}

function setupStatefulComponents(instance: any) {
    const Component = instance.type;

    const { setup } = Component;

    if (setup) {
        const setupResult = setup();

        handleSetupResult(instance, setupResult);
    }
}

function handleSetupResult(instance: any, setupResult: any) {
    // function object
    // TODO function
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }

    finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
    const Component = instance.type;

    // render 往外提了一层
    instance.render = Component.render;
}
