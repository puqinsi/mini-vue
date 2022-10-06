import { shallowReadonly } from "../reactivity/reactive";
import { proxyRefs } from "../reactivity/ref";
import { emit } from "./componentEmit";
import { initProps } from "./componentProps";
import { publicInstanceProxyHandlers } from "./componentPublicInstance";
import { initSlots } from "./componentSlots";

export function createComponentInstance(vnode: any, parent: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    slots: [],
    provides: parent ? parent.provides : {},
    update: null, // effect runner
    next: null, // 更新的 vnode
    parent,
    isMounted: false,
    subTree: {},
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
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadonly(instance.props), {
      emit: instance.emit,
    });
    setCurrentInstance(null);

    handleSetupResult(instance, setupResult);
  }
}

// 挂载 setup 数据到组件实例
function handleSetupResult(instance: any, setupResult: any) {
  // function object
  // TODO function
  if (typeof setupResult === "object") {
    // setup 脱 ref
    instance.setupState = proxyRefs(setupResult);
  }

  finishComponentSetup(instance);
}

// render 往外提了一层
function finishComponentSetup(instance: any) {
  const Component = instance.type;
  if (compiler && !Component.render) {
    if (Component.template) {
      Component.render = compiler(Component.template);
    }
  }
  instance.render = Component.render;
}

let currentInstance: any = null;
export function getCurrentInstance() {
  return currentInstance;
}

function setCurrentInstance(instance: any) {
  currentInstance = instance;
}

// 定义一个编译器，外部模块可以通过接口注入，给 compiler 赋值。
let compiler: any;
export function registerRuntimeCompiler(_compiler: any) {
  compiler = _compiler;
}
