import {
    mutableHandlers,
    readonlyHandlers,
    shallowReactiveHandlers,
    shallowReadonlyHandlers,
} from "./baseHandlers";

export const enum ReactiveFlags {
    IS_REACTIVE = "_v_isReactive",
    IS_READONLY = "_v_isReadonly",
}

export function reactive(obj: any): any {
    return createActiveObj(obj, mutableHandlers);
}

export function readonly(obj: any): any {
    return createActiveObj(obj, readonlyHandlers);
}

export function shallowReactive(obj: any): any {
    return createActiveObj(obj, shallowReactiveHandlers);
}
export function shallowReadonly(obj: any): any {
    return createActiveObj(obj, shallowReadonlyHandlers);
}

export function isReactive(value: any): boolean {
    // 触发 get
    return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value: any): boolean {
    // 触发 get
    return !!value[ReactiveFlags.IS_READONLY];
}

export function isProxy(value: any): boolean {
    return isReactive(value) || isReadonly(value);
}

function createActiveObj(obj: any, baseHandlers: any) {
    return new Proxy(obj, baseHandlers);
}
