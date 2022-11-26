import { getCurrentInstance } from "./component";

// 只能在 setup 内使用，与 currentInstance 设置有关
export function provide(key: any, value: any) {
  const currentInstance = getCurrentInstance();
  if (currentInstance) {
    let { provides } = currentInstance;
    const parentProvides = currentInstance.parent?.provides;

    // 只在初始化的时候重写 provides, 避免后面调用 provide 覆盖 parentProvides
    if (provides === parentProvides) {
      // 利用原型链重写 provides, 解决 provides 引用覆盖问题
      provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
  }
}

export function inject(key: any, defaultValue: any) {
  const currentInstance = getCurrentInstance();
  if (currentInstance) {
    const parentProvides = currentInstance.parent.provides;
    if (key in parentProvides) {
      return parentProvides[key];
    }
    if (typeof defaultValue === "function") {
      return defaultValue();
    }
    return defaultValue;
  }
}
