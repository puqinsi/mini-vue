import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

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

export function isReactive(value: any): boolean {
    return !!value[ReactiveFlags.IS_REACTIVE];
}

export function isReadonly(value: any): boolean {
    return !!value[ReactiveFlags.IS_READONLY];
}

function createActiveObj(obj: any, baseHandlers: any) {
    return new Proxy(obj, baseHandlers);
}
