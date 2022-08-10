import { extend, isObject } from "../shared";
import { track, trigger } from "./effect";
import { reactive, ReactiveFlags, readonly } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReactiveGet = createGetter(false, true);
const shallowReadonlyGet = createGetter(true, true);

// 高阶函数
function createGetter(isReadonly: boolean = false, shallow: boolean = false) {
    return function get(target: any, key: any) {
        // 根据是不是只读来判断
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
        }

        const res = Reflect.get(target, key);

        if (shallow) {
            // 此时返回的 res 不是响应式的，没有 get 和 set
            return res;
        }

        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }

        if (!isReadonly) {
            // 收集依赖
            track(target, key);
        }
        return res;
    };
}

function createSetter() {
    return function set(target: any, key: any, value: any) {
        const res = Reflect.set(target, key, value);

        // 触发依赖
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
        console.warn(
            `key: ${key} set failed because target is readonly`,
            target,
        );
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
