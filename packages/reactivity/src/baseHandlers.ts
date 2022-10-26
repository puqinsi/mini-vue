import { extend, isObject } from "@mini-vue/shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReactiveGet = createGetter(false, true);
const shallowReadonlyGet = createGetter(true, true);
/* TODO 添加第三个参数 receiver */
// 高阶函数
function createGetter(isReadonly: boolean = false, shallow: boolean = false) {
  // 返回的 get 是一个闭包函数，再调用 get 的时候可以获取到创建时的参数：isReadonly 和 shallow
  return function get(target: any, key: any, receiver: any) {
    // 根据是不是只读来判断
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly;
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly;
    }

    // 这里必须使用 Reflect，而且要传入第三个参数 receiver，代表执行的 this 是代理对象。
    const res = Reflect.get(target, key, receiver);

    // 只读不能修改值，不需要触发副作用，不需要收集依赖
    if (!isReadonly) {
      // 取值时，收集依赖
      track(target, key);
    }

    if (shallow) {
      return res;
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    return res;
  };
}

function createSetter() {
  return function set(target: any, key: any, value: any) {
    const res = Reflect.set(target, key, value);

    // 修改值时，触发依赖
    trigger(target, key);
    return res;
  };
}

export const mutableHandlers = {
  set,
  get,
};

export const readonlyHandlers = {
  set(target: any, key: any, value: any) {
    console.warn(`key: ${key} set failed because target is readonly`, target);
    return true;
  },
  get: readonlyGet,
};

export const shallowReactiveHandlers = extend({}, mutableHandlers, {
  get: shallowReactiveGet,
});

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
});
