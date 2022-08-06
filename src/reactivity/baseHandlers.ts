import { track, trigger } from "./effect";
import { ReactiveFlags } from "./reactive";

const get = createGetter();
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadonly: boolean = false) {
    return function get(target: any, key: any) {
        const res = Reflect.get(target, key);

        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly;
        }

        if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly;
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
